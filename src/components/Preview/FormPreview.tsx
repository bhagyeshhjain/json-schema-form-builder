import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, Send } from 'lucide-react';
import type { FormField, FormSchema, ViewportSize } from '../../types/schema';
import { getFieldRenderer } from '../FormCanvas/FieldRenderers/fieldRegistry';
import './FormPreview.css';

interface FormPreviewProps {
  schema: FormSchema;
  onClose: () => void;
}

export function FormPreview({ schema, onClose }: FormPreviewProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const evaluateConditions = (field: FormField): boolean => {
    if (!field.conditionalLogic || field.conditionalLogic.conditions.length === 0) return true;

    const { conditions, operator, action } = field.conditionalLogic;
    const results = conditions.map((cond) => {
      const value = formData[cond.field];
      switch (cond.operator) {
        case 'equals': return String(value) === cond.value;
        case 'notEquals': return String(value) !== cond.value;
        case 'contains': return String(value || '').includes(cond.value);
        case 'greaterThan': return Number(value) > Number(cond.value);
        case 'lessThan': return Number(value) < Number(cond.value);
        case 'isEmpty': return !value || value === '';
        case 'isNotEmpty': return !!value && value !== '';
        default: return false;
      }
    });

    const match = operator === 'and' ? results.every(Boolean) : results.some(Boolean);
    return action === 'show' ? match : !match;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const viewportClass =
    viewportSize === 'tablet' ? 'preview__viewport--tablet' :
    viewportSize === 'mobile' ? 'preview__viewport--mobile' : '';

  return (
    <div className="preview-overlay">
      <div className="preview">
        {/* Header */}
        <div className="preview__header">
          <h2 className="preview__title">Form Preview</h2>
          <div className="preview__viewport-toggle">
            {([
              { key: 'desktop' as const, icon: Monitor },
              { key: 'tablet' as const, icon: Tablet },
              { key: 'mobile' as const, icon: Smartphone },
            ]).map(({ key, icon: Icon }) => (
              <button
                key={key}
                className={`preview__viewport-btn ${viewportSize === key ? 'preview__viewport-btn--active' : ''}`}
                onClick={() => setViewportSize(key)}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button className="preview__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="preview__body">
          <div className={`preview__viewport ${viewportClass}`}>
            {submitted ? (
              <div className="preview__success">
                <div className="preview__success-icon">✓</div>
                <h3>Form Submitted Successfully!</h3>
                <p>Here's the collected data:</p>
                <pre className="preview__data-output">
                  {JSON.stringify(formData, null, 2)}
                </pre>
                <button className="preview__reset-btn" onClick={() => { setSubmitted(false); setFormData({}); }}>
                  Reset Form
                </button>
              </div>
            ) : (
              <form className="preview__form" onSubmit={handleSubmit}>
                <h1 className="preview__form-title">{schema.title}</h1>
                {schema.description && <p className="preview__form-desc">{schema.description}</p>}

                <div className="preview__fields">
                  {schema.fields.map((field) => {
                    if (!evaluateConditions(field)) return null;

                    return (
                      <div key={field.id} className={`preview__field-wrapper preview__field-wrapper--width-${field.width || 'full'}`}>
                        <PreviewFieldInput
                          field={field}
                          value={formData[field.fieldKey]}
                          onChange={(val) => setFormData((prev) => ({ ...prev, [field.fieldKey]: val }))}
                        />
                      </div>
                    );
                  })}
                </div>

                <button type="submit" className="preview__submit-btn">
                  <Send size={15} />
                  {schema.settings.submitButtonText || 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Live Input Field ── */
function PreviewFieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: any;
  onChange: (val: any) => void;
}) {
  const isLayout = ['heading', 'divider', 'paragraph'].includes(field.type);

  if (isLayout) {
    const Renderer = getFieldRenderer(field.type);
    return <Renderer field={field} />;
  }

  return (
    <div className="preview-field">
      <label className="preview-field__label">
        {field.label}
        {field.required && <span className="preview-field__required">*</span>}
      </label>

      {field.type === 'text' || field.type === 'email' || field.type === 'password' ? (
        <input
          type={field.type}
          className="preview-field__input"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      ) : field.type === 'number' ? (
        <input
          type="number"
          className="preview-field__input"
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          required={field.required}
        />
      ) : field.type === 'textarea' ? (
        <textarea
          className="preview-field__textarea"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          required={field.required}
        />
      ) : field.type === 'dropdown' ? (
        <select
          className="preview-field__select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">{field.placeholder || 'Select...'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : field.type === 'radio' ? (
        <div className="preview-field__radio-group">
          {field.options?.map((opt) => (
            <label key={opt.value} className="preview-field__radio-label">
              <input
                type="radio"
                name={field.fieldKey}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === 'checkbox' ? (
        <div className="preview-field__checkbox-group">
          {field.options?.map((opt) => (
            <label key={opt.value} className="preview-field__checkbox-label">
              <input
                type="checkbox"
                value={opt.value}
                checked={(value || []).includes(opt.value)}
                onChange={(e) => {
                  const arr = value || [];
                  onChange(
                    e.target.checked
                      ? [...arr, opt.value]
                      : arr.filter((v: string) => v !== opt.value)
                  );
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === 'toggle' ? (
        <label className="preview-field__toggle">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="preview-field__toggle-track" />
        </label>
      ) : field.type === 'date' ? (
        <input type="date" className="preview-field__input" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
      ) : field.type === 'time' ? (
        <input type="time" className="preview-field__input" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
      ) : field.type === 'datetime' ? (
        <input type="datetime-local" className="preview-field__input" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
      ) : field.type === 'file' ? (
        <input type="file" accept={field.accept} onChange={(e) => onChange(e.target.files?.[0]?.name || '')} />
      ) : (
        <input type="text" className="preview-field__input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}

      {field.helpText && <p className="preview-field__help">{field.helpText}</p>}
    </div>
  );
}
