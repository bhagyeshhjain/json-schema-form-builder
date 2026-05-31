import type { FormSchema, FormField } from '../types/schema';

/**
 * Generate Zod validation schema code from the form schema
 */
export function generateZodSchema(formSchema: FormSchema): string {
  const lines: string[] = [];
  lines.push(`import { z } from 'zod';`);
  lines.push('');
  lines.push(`// Generated from: ${formSchema.title}`);
  lines.push(`// Version: ${formSchema.version}`);
  lines.push(`// Generated at: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('export const formSchema = z.object({');

  for (const field of formSchema.fields) {
    if (['heading', 'divider', 'paragraph'].includes(field.type)) continue;

    const zodType = fieldToZodType(field);
    const comment = `  // ${field.label}`;
    lines.push(comment);
    lines.push(`  ${field.fieldKey}: ${zodType},`);
    lines.push('');
  }

  lines.push('});');
  lines.push('');
  lines.push('export type FormData = z.infer<typeof formSchema>;');

  return lines.join('\n');
}

function fieldToZodType(field: FormField): string {
  let type: string;

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'password':
      type = 'z.string()';
      if (field.validation?.minLength) {
        type += `.min(${field.validation.minLength}, "${field.validation.customMessage || `Minimum ${field.validation.minLength} characters`}")`;
      }
      if (field.validation?.maxLength) {
        type += `.max(${field.validation.maxLength}, "${field.validation.customMessage || `Maximum ${field.validation.maxLength} characters`}")`;
      }
      if (field.validation?.pattern) {
        const msg = field.validation.patternMessage || 'Invalid format';
        type += `.regex(/${field.validation.pattern}/, "${msg}")`;
      }
      break;

    case 'email':
      type = 'z.string().email("Please enter a valid email address")';
      if (field.validation?.minLength) {
        type += `.min(${field.validation.minLength})`;
      }
      if (field.validation?.maxLength) {
        type += `.max(${field.validation.maxLength})`;
      }
      break;

    case 'number':
      type = 'z.number()';
      if (field.validation?.min !== undefined) {
        type += `.min(${field.validation.min}, "Minimum value is ${field.validation.min}")`;
      }
      if (field.validation?.max !== undefined) {
        type += `.max(${field.validation.max}, "Maximum value is ${field.validation.max}")`;
      }
      break;

    case 'dropdown':
    case 'radio':
      if (field.options?.length) {
        const values = field.options.map((o) => `'${o.value}'`).join(', ');
        type = `z.enum([${values}])`;
      } else {
        type = 'z.string()';
      }
      break;

    case 'checkbox':
      if (field.options?.length) {
        const values = field.options.map((o) => `'${o.value}'`).join(', ');
        type = `z.array(z.enum([${values}]))`;
      } else {
        type = 'z.array(z.string())';
      }
      break;

    case 'toggle':
      type = 'z.boolean()';
      break;

    case 'date':
      type = 'z.string().date("Please enter a valid date")';
      break;

    case 'time':
      type = 'z.string().time("Please enter a valid time")';
      break;

    case 'datetime':
      type = 'z.string().datetime("Please enter a valid date and time")';
      break;

    case 'file':
      type = 'z.instanceof(File)';
      break;

    case 'signature':
      type = 'z.string().min(1, "Signature is required")';
      break;

    default:
      type = 'z.string()';
  }

  // Handle required/optional
  if (!field.required) {
    type += '.optional()';
  }

  return type;
}
