
import type { FormField } from '../../../types/schema';
import './FieldRenderers.css';

interface RendererProps {
  field: FormField;
  isCanvas?: boolean;
}

export function TextFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="text"
        className="field-renderer__input"
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        defaultValue={field.defaultValue}
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function NumberFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="number"
        className="field-renderer__input"
        placeholder={field.placeholder || '0'}
        defaultValue={field.defaultValue}
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function EmailFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="email"
        className="field-renderer__input"
        placeholder={field.placeholder || 'email@example.com'}
        defaultValue={field.defaultValue}
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function TextareaFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <textarea
        className="field-renderer__textarea"
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        defaultValue={field.defaultValue}
        disabled={isCanvas}
        readOnly={isCanvas}
        rows={3}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function PasswordFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="password"
        className="field-renderer__input"
        placeholder={field.placeholder || '••••••••'}
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function DropdownFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <select
        className="field-renderer__select"
        disabled={isCanvas}
        defaultValue={field.defaultValue || ''}
      >
        <option value="" disabled>{field.placeholder || 'Select an option...'}</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function RadioGroupRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <div className="field-renderer__radio-group">
        {field.options?.map((opt) => (
          <label key={opt.value} className="field-renderer__radio-option">
            <input
              type="radio"
              name={isCanvas ? `canvas-${field.id}` : field.fieldKey}
              value={opt.value}
              disabled={isCanvas}
              defaultChecked={field.defaultValue === opt.value}
            />
            <span className="field-renderer__radio-custom" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function CheckboxRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <div className="field-renderer__checkbox-group">
        {field.options?.map((opt) => (
          <label key={opt.value} className="field-renderer__checkbox-option">
            <input
              type="checkbox"
              value={opt.value}
              disabled={isCanvas}
            />
            <span className="field-renderer__checkbox-custom" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function ToggleFieldRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <div className="field-renderer__toggle-row">
        <label className="field-renderer__label" style={{ marginBottom: 0 }}>
          {field.label}
          {field.required && <span className="field-renderer__required">*</span>}
        </label>
        <label className="field-renderer__toggle">
          <input type="checkbox" disabled={isCanvas} defaultChecked={field.defaultValue === 'true'} />
          <span className="field-renderer__toggle-track" />
        </label>
      </div>
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function DatePickerRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="date"
        className="field-renderer__input"
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function TimePickerRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="time"
        className="field-renderer__input"
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function DateTimePickerRenderer({ field, isCanvas }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <input
        type="datetime-local"
        className="field-renderer__input"
        disabled={isCanvas}
        readOnly={isCanvas}
      />
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function FileUploadRenderer({ field }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <div className="field-renderer__file-drop">
        <div className="field-renderer__file-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="field-renderer__file-text">
          Drag & drop or <span>browse</span>
        </p>
        <p className="field-renderer__file-hint">
          {field.accept !== '*/*' ? field.accept : 'Any file type'} • Max {field.maxFileSize || 5}MB
        </p>
      </div>
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function SignatureRenderer({ field }: RendererProps) {
  return (
    <div className="field-renderer">
      <label className="field-renderer__label">
        {field.label}
        {field.required && <span className="field-renderer__required">*</span>}
      </label>
      <div className="field-renderer__signature-pad">
        <p className="field-renderer__signature-text">Sign here</p>
      </div>
      {field.helpText && <p className="field-renderer__help">{field.helpText}</p>}
    </div>
  );
}

export function HeadingRenderer({ field }: RendererProps) {
  const Tag = field.headingLevel || 'h2';
  return (
    <div className="field-renderer field-renderer--layout">
      <Tag className="field-renderer__heading">{field.content || field.label}</Tag>
    </div>
  );
}

export function DividerRenderer() {
  return (
    <div className="field-renderer field-renderer--layout">
      <hr className="field-renderer__divider" />
    </div>
  );
}

export function ParagraphRenderer({ field }: RendererProps) {
  return (
    <div className="field-renderer field-renderer--layout">
      <p className="field-renderer__paragraph">{field.content || field.label}</p>
    </div>
  );
}
