import type { FormSchema, FormField } from '../types/schema';

/**
 * Generate a standalone React component from the form schema
 */
export function generateReactComponent(formSchema: FormSchema): string {
  const fields = formSchema.fields.filter(
    (f) => !['heading', 'divider', 'paragraph'].includes(f.type)
  );
  const allFields = formSchema.fields;

  const lines: string[] = [];

  // Imports
  lines.push(`import React, { useState } from 'react';`);
  lines.push('');
  lines.push(`// ${formSchema.title}`);
  lines.push(`// Generated at: ${new Date().toISOString()}`);
  lines.push('');

  // Type definition
  lines.push('interface FormData {');
  for (const field of fields) {
    const tsType = fieldToTypeScriptType(field);
    const optional = field.required ? '' : '?';
    lines.push(`  ${field.fieldKey}${optional}: ${tsType};`);
  }
  lines.push('}');
  lines.push('');

  // Component
  lines.push(`interface ${sanitizeName(formSchema.title)}Props {`);
  lines.push('  onSubmit: (data: FormData) => void;');
  lines.push('}');
  lines.push('');
  lines.push(`export function ${sanitizeName(formSchema.title)}({ onSubmit }: ${sanitizeName(formSchema.title)}Props) {`);
  lines.push('  const [formData, setFormData] = useState<Partial<FormData>>({});');
  lines.push('  const [errors, setErrors] = useState<Record<string, string>>({});');
  lines.push('');
  lines.push('  const handleChange = (key: string, value: any) => {');
  lines.push('    setFormData(prev => ({ ...prev, [key]: value }));');
  lines.push('    setErrors(prev => ({ ...prev, [key]: "" }));');
  lines.push('  };');
  lines.push('');

  // Validation function
  lines.push('  const validate = (): boolean => {');
  lines.push('    const newErrors: Record<string, string> = {};');
  for (const field of fields) {
    if (field.required) {
      lines.push(`    if (!formData.${field.fieldKey}) newErrors.${field.fieldKey} = "${field.validation?.customMessage || `${field.label} is required`}";`);
    }
  }
  lines.push('    setErrors(newErrors);');
  lines.push('    return Object.keys(newErrors).length === 0;');
  lines.push('  };');
  lines.push('');

  lines.push('  const handleSubmit = (e: React.FormEvent) => {');
  lines.push('    e.preventDefault();');
  lines.push('    if (validate()) onSubmit(formData as FormData);');
  lines.push('  };');
  lines.push('');

  // Conditional visibility helpers
  const fieldsWithLogic = allFields.filter(
    (f) => f.conditionalLogic && f.conditionalLogic.conditions.length > 0
  );
  if (fieldsWithLogic.length > 0) {
    lines.push('  // Conditional visibility');
    for (const field of fieldsWithLogic) {
      const conditions = field.conditionalLogic!.conditions.map((c) => {
        switch (c.operator) {
          case 'equals': return `formData.${c.field} === "${c.value}"`;
          case 'notEquals': return `formData.${c.field} !== "${c.value}"`;
          case 'isEmpty': return `!formData.${c.field}`;
          case 'isNotEmpty': return `!!formData.${c.field}`;
          default: return `formData.${c.field} === "${c.value}"`;
        }
      });
      const joiner = field.conditionalLogic!.operator === 'and' ? ' && ' : ' || ';
      const condExpr = conditions.join(joiner);
      const visible = field.conditionalLogic!.action === 'show';
      lines.push(`  const show${capitalize(field.fieldKey)} = ${visible ? condExpr : `!(${condExpr})`};`);
    }
    lines.push('');
  }

  // Render
  lines.push('  return (');
  lines.push('    <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>');
  lines.push(`      <h1>${formSchema.title}</h1>`);
  if (formSchema.description) {
    lines.push(`      <p>${formSchema.description}</p>`);
  }
  lines.push('');
  lines.push('      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 20px" }}>');

  for (const field of allFields) {
    const hasLogic = field.conditionalLogic && field.conditionalLogic.conditions.length > 0;
    const wrapper = hasLogic ? `show${capitalize(field.fieldKey)}` : null;

    if (wrapper) lines.push(`      {${wrapper} && (`);

    switch (field.type) {
      case 'heading':
        lines.push(`      <${field.headingLevel || 'h2'}>${field.content || field.label}</${field.headingLevel || 'h2'}>`);
        break;
      case 'divider':
        lines.push('      <hr />');
        break;
      case 'paragraph':
        lines.push(`      <p>${field.content || field.label}</p>`);
        break;
      default:
        const widthStyle = field.width === 'half' ? 'calc(50% - 10px)' : field.width === 'third' ? 'calc(33.33% - 14px)' : '100%';
        lines.push(`        <div style={{ width: "${widthStyle}", marginBottom: 8 }}>`);
        lines.push(`          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>${field.label}${field.required ? ' *' : ''}</label>`);
        lines.push(generateFieldJSX(field));
        lines.push(`          {errors.${field.fieldKey} && <span style={{ color: "red", fontSize: 12, marginTop: 4, display: "block" }}>{errors.${field.fieldKey}}</span>}`);
        lines.push('        </div>');
    }

    if (wrapper) lines.push('      )}');
  }
  lines.push('      </div>');

  lines.push('');
  lines.push(`      <button type="submit" style={{ marginTop: 24, padding: "10px 32px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>`);
  lines.push(`        ${formSchema.settings.submitButtonText || 'Submit'}`);
  lines.push('      </button>');
  lines.push('    </form>');
  lines.push('  );');
  lines.push('}');

  return lines.join('\n');
}

function generateFieldJSX(field: FormField): string {
  const onChange = `onChange={(e) => handleChange("${field.fieldKey}", e.target.value)}`;
  const value = `value={formData.${field.fieldKey} || ""}`;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
      return `        <input type="${field.type}" ${value} ${onChange} placeholder="${field.placeholder || ''}" style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;

    case 'number':
      return `        <input type="number" value={formData.${field.fieldKey} ?? ""} onChange={(e) => handleChange("${field.fieldKey}", Number(e.target.value))} placeholder="${field.placeholder || ''}" style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;

    case 'textarea':
      return `        <textarea ${value} ${onChange} placeholder="${field.placeholder || ''}" rows={3} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;

    case 'dropdown':
      const options = field.options?.map((o) => `          <option value="${o.value}">${o.label}</option>`).join('\n') || '';
      return `        <select ${value} ${onChange} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}>\n          <option value="">${field.placeholder || 'Select...'}</option>\n${options}\n        </select>`;

    case 'radio':
      const radios = field.options?.map(
        (o) => `          <label style={{ marginRight: 16 }}><input type="radio" name="${field.fieldKey}" value="${o.value}" checked={formData.${field.fieldKey} === "${o.value}"} onChange={(e) => handleChange("${field.fieldKey}", e.target.value)} /> ${o.label}</label>`
      ).join('\n') || '';
      return `        <div>\n${radios}\n        </div>`;

    case 'checkbox':
      return `        <div>\n${field.options?.map(
        (o) => `          <label style={{ marginRight: 16 }}><input type="checkbox" value="${o.value}" checked={(formData.${field.fieldKey} as string[] || []).includes("${o.value}")} onChange={(e) => { const arr = formData.${field.fieldKey} as string[] || []; handleChange("${field.fieldKey}", e.target.checked ? [...arr, "${o.value}"] : arr.filter(v => v !== "${o.value}")); }} /> ${o.label}</label>`
      ).join('\n') || ''}\n        </div>`;

    case 'toggle':
      return `        <input type="checkbox" checked={!!formData.${field.fieldKey}} onChange={(e) => handleChange("${field.fieldKey}", e.target.checked)} />`;

    case 'date':
      return `        <input type="date" ${value} ${onChange} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;

    case 'time':
      return `        <input type="time" ${value} ${onChange} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;

    case 'datetime':
      return `        <input type="datetime-local" ${value} ${onChange} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;

    case 'file':
      return `        <input type="file" accept="${field.accept || '*/*'}" onChange={(e) => handleChange("${field.fieldKey}", e.target.files?.[0])} />`;

    case 'signature':
      return `        <div style={{ border: "2px dashed #d1d5db", padding: 24, textAlign: "center", borderRadius: 8 }}>Signature Pad Placeholder</div>`;

    default:
      return `        <input type="text" ${value} ${onChange} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />`;
  }
}

function fieldToTypeScriptType(field: FormField): string {
  switch (field.type) {
    case 'number': return 'number';
    case 'toggle': return 'boolean';
    case 'checkbox': return 'string[]';
    case 'file': return 'File';
    default: return 'string';
  }
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedForm';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
