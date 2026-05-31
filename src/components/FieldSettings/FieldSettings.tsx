import { X, Plus, Trash2 } from 'lucide-react';
import type { FormField, SettingsTab, FieldOption, FieldCondition } from '../../types/schema';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { labelToFieldKey } from '../../utils/helpers';
import './FieldSettings.css';

export function FieldSettings() {
  const {
    schema,
    selectedFieldId,
    activeSettingsTab,
    setActiveSettingsTab,
    updateField,
    selectField,
    pushHistory,
  } = useFormBuilderStore();

  const field = schema.fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <aside className="field-settings field-settings--empty">
        <div className="field-settings__placeholder">
          <p>Select a field to edit its properties</p>
        </div>
      </aside>
    );
  }

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'validation', label: 'Validation' },
    { key: 'conditional', label: 'Conditional Logic' },
    { key: 'permissions', label: 'Permissions' },
  ];

  return (
    <aside className="field-settings">
      <div className="field-settings__header">
        <h2 className="field-settings__title">Field Settings</h2>
        <button className="field-settings__close" onClick={() => selectField(null)}>
          <X size={16} />
        </button>
      </div>

      <div className="field-settings__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`field-settings__tab ${activeSettingsTab === tab.key ? 'field-settings__tab--active' : ''}`}
            onClick={() => setActiveSettingsTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="field-settings__content">
        {activeSettingsTab === 'general' && (
          <GeneralSettings field={field} updateField={updateField} pushHistory={pushHistory} />
        )}
        {activeSettingsTab === 'validation' && (
          <ValidationSettings field={field} updateField={updateField} pushHistory={pushHistory} />
        )}
        {activeSettingsTab === 'conditional' && (
          <ConditionalLogicSettings field={field} allFields={schema.fields} updateField={updateField} pushHistory={pushHistory} />
        )}
        {activeSettingsTab === 'permissions' && (
          <PermissionsSettings field={field} updateField={updateField} />
        )}
      </div>
    </aside>
  );
}

/* ── General Settings ── */
interface SettingsProps {
  field: FormField;
  updateField: (id: string, updates: Partial<FormField>) => void;
  pushHistory?: () => void;
}

function GeneralSettings({ field, updateField, pushHistory }: SettingsProps) {
  const isLayoutField = ['heading', 'divider', 'paragraph'].includes(field.type);
  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="settings-section">
      <div className="settings-group">
        <label className="settings-label">Label</label>
        <input
          className="settings-input"
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          onBlur={() => pushHistory?.()}
        />
      </div>

      {!isLayoutField && (
        <>
          <div className="settings-group">
            <label className="settings-label">Field Key</label>
            <input
              className="settings-input settings-input--mono"
              value={field.fieldKey}
              onChange={(e) => updateField(field.id, { fieldKey: e.target.value })}
              onBlur={() => pushHistory?.()}
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">Placeholder</label>
            <input
              className="settings-input"
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">Default Value</label>
            <input
              className="settings-input"
              value={field.defaultValue || ''}
              onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
            />
          </div>

          <div className="settings-group">
            <label className="settings-label">Help Text</label>
            <input
              className="settings-input"
              value={field.helpText || ''}
              onChange={(e) => updateField(field.id, { helpText: e.target.value })}
              placeholder="Additional guidance for the user"
            />
          </div>

          <div className="settings-group settings-group--row">
            <label className="settings-label">Required</label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => {
                  pushHistory?.();
                  updateField(field.id, { required: e.target.checked });
                }}
              />
              <span className="settings-toggle__track" />
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-label">Width</label>
            <div className="settings-width-selector">
              {(['full', 'half', 'third'] as const).map((w) => (
                <button
                  key={w}
                  className={`settings-width-btn ${field.width === w ? 'settings-width-btn--active' : ''}`}
                  onClick={() => updateField(field.id, { width: w })}
                >
                  {w === 'full' ? '100%' : w === 'half' ? '50%' : '33%'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {(field.type === 'heading' || field.type === 'paragraph') && (
        <div className="settings-group">
          <label className="settings-label">Content</label>
          <textarea
            className="settings-input"
            value={field.content || ''}
            onChange={(e) => updateField(field.id, { content: e.target.value })}
            rows={3}
          />
        </div>
      )}

      {field.type === 'heading' && (
        <div className="settings-group">
          <label className="settings-label">Heading Level</label>
          <select
            className="settings-input"
            value={field.headingLevel || 'h2'}
            onChange={(e) => updateField(field.id, { headingLevel: e.target.value as 'h1' | 'h2' | 'h3' | 'h4' })}
          >
            <option value="h1">H1 — Large</option>
            <option value="h2">H2 — Medium</option>
            <option value="h3">H3 — Small</option>
            <option value="h4">H4 — Extra Small</option>
          </select>
        </div>
      )}

      {hasOptions && (
        <OptionsEditor
          options={field.options || []}
          onChange={(options) => updateField(field.id, { options })}
          pushHistory={pushHistory}
        />
      )}
    </div>
  );
}

/* ── Options Editor ── */
function OptionsEditor({
  options,
  onChange,
  pushHistory,
}: {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
  pushHistory?: () => void;
}) {
  const updateOption = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [key]: val };
    if (key === 'label') {
      updated[index].value = labelToFieldKey(val);
    }
    onChange(updated);
  };

  const addOption = () => {
    pushHistory?.();
    const num = options.length + 1;
    onChange([...options, { label: `Option ${num}`, value: `option${num}` }]);
  };

  const removeOption = (index: number) => {
    pushHistory?.();
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="settings-group">
      <label className="settings-label">Options</label>
      <div className="options-editor">
        {options.map((opt, i) => (
          <div key={i} className="options-editor__row">
            <input
              className="settings-input options-editor__input"
              value={opt.label}
              onChange={(e) => updateOption(i, 'label', e.target.value)}
              onBlur={() => pushHistory?.()}
              placeholder="Label"
            />
            <button
              className="options-editor__remove"
              onClick={() => removeOption(i)}
              disabled={options.length <= 1}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button className="options-editor__add" onClick={addOption}>
          <Plus size={13} />
          Add Option
        </button>
      </div>
    </div>
  );
}

/* ── Validation Settings ── */
function ValidationSettings({ field, updateField, pushHistory }: SettingsProps) {
  const validation = field.validation || {};
  const update = (updates: Partial<FormField['validation']>) => {
    updateField(field.id, { validation: { ...validation, ...updates } });
  };

  const isText = ['text', 'email', 'textarea', 'password'].includes(field.type);
  const isNumber = field.type === 'number';

  return (
    <div className="settings-section">
      {isText && (
        <>
          <div className="settings-group">
            <label className="settings-label">Min Length</label>
            <input
              className="settings-input"
              type="number"
              value={validation.minLength ?? ''}
              onChange={(e) => update({ minLength: e.target.value ? Number(e.target.value) : undefined })}
              onBlur={() => pushHistory?.()}
              placeholder="No minimum"
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Max Length</label>
            <input
              className="settings-input"
              type="number"
              value={validation.maxLength ?? ''}
              onChange={(e) => update({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
              onBlur={() => pushHistory?.()}
              placeholder="No maximum"
            />
          </div>
        </>
      )}

      {isNumber && (
        <>
          <div className="settings-group">
            <label className="settings-label">Minimum Value</label>
            <input
              className="settings-input"
              type="number"
              value={validation.min ?? ''}
              onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })}
              onBlur={() => pushHistory?.()}
              placeholder="No minimum"
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Maximum Value</label>
            <input
              className="settings-input"
              type="number"
              value={validation.max ?? ''}
              onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })}
              onBlur={() => pushHistory?.()}
              placeholder="No maximum"
            />
          </div>
        </>
      )}

      {isText && (
        <>
          <div className="settings-group">
            <label className="settings-label">Pattern (Regex)</label>
            <input
              className="settings-input settings-input--mono"
              value={validation.pattern || ''}
              onChange={(e) => update({ pattern: e.target.value })}
              onBlur={() => pushHistory?.()}
              placeholder="e.g. ^[a-zA-Z]+$"
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Pattern Error Message</label>
            <input
              className="settings-input"
              value={validation.patternMessage || ''}
              onChange={(e) => update({ patternMessage: e.target.value })}
              placeholder="Invalid format"
            />
          </div>
        </>
      )}

      <div className="settings-group">
        <label className="settings-label">Custom Error Message</label>
        <input
          className="settings-input"
          value={validation.customMessage || ''}
          onChange={(e) => update({ customMessage: e.target.value })}
          placeholder="This field is required"
        />
      </div>
    </div>
  );
}

/* ── Conditional Logic Settings ── */
function ConditionalLogicSettings({
  field,
  allFields,
  updateField,
  pushHistory,
}: SettingsProps & { allFields: FormField[] }) {
  const logic = field.conditionalLogic || { action: 'show' as const, operator: 'and' as const, conditions: [] };
  const otherFields = allFields.filter((f) => f.id !== field.id && !['heading', 'divider', 'paragraph'].includes(f.type));

  const updateLogic = (updates: Partial<typeof logic>) => {
    updateField(field.id, { conditionalLogic: { ...logic, ...updates } });
  };

  const addCondition = () => {
    pushHistory?.();
    const newCondition: FieldCondition = {
      field: otherFields[0]?.fieldKey || '',
      operator: 'equals',
      value: '',
    };
    updateLogic({ conditions: [...logic.conditions, newCondition] });
  };

  const updateCondition = (index: number, updates: Partial<FieldCondition>) => {
    const conditions = [...logic.conditions];
    conditions[index] = { ...conditions[index], ...updates };
    updateLogic({ conditions });
  };

  const removeCondition = (index: number) => {
    pushHistory?.();
    updateLogic({ conditions: logic.conditions.filter((_, i) => i !== index) });
  };

  return (
    <div className="settings-section">
      <div className="settings-group">
        <label className="settings-label">Action</label>
        <select
          className="settings-input"
          value={logic.action}
          onChange={(e) => updateLogic({ action: e.target.value as 'show' | 'hide' })}
        >
          <option value="show">Show this field</option>
          <option value="hide">Hide this field</option>
        </select>
      </div>

      {logic.conditions.length > 1 && (
        <div className="settings-group">
          <label className="settings-label">Match</label>
          <select
            className="settings-input"
            value={logic.operator}
            onChange={(e) => updateLogic({ operator: e.target.value as 'and' | 'or' })}
          >
            <option value="and">All conditions (AND)</option>
            <option value="or">Any condition (OR)</option>
          </select>
        </div>
      )}

      <div className="conditions-list">
        <label className="settings-label">Conditions</label>
        {logic.conditions.map((cond, i) => (
          <div key={i} className="condition-row">
            <select
              className="settings-input condition-row__field"
              value={cond.field}
              onChange={(e) => updateCondition(i, { field: e.target.value })}
            >
              <option value="">Select field...</option>
              {otherFields.map((f) => (
                <option key={f.id} value={f.fieldKey}>{f.label}</option>
              ))}
            </select>
            <select
              className="settings-input condition-row__operator"
              value={cond.operator}
              onChange={(e) => updateCondition(i, { operator: e.target.value as FieldCondition['operator'] })}
            >
              <option value="equals">equals</option>
              <option value="notEquals">not equals</option>
              <option value="contains">contains</option>
              <option value="greaterThan">greater than</option>
              <option value="lessThan">less than</option>
              <option value="isEmpty">is empty</option>
              <option value="isNotEmpty">is not empty</option>
            </select>
            {!['isEmpty', 'isNotEmpty'].includes(cond.operator) && (
              <input
                className="settings-input condition-row__value"
                value={cond.value}
                onChange={(e) => updateCondition(i, { value: e.target.value })}
                placeholder="Value"
              />
            )}
            <button className="condition-row__remove" onClick={() => removeCondition(i)}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button className="options-editor__add" onClick={addCondition}>
          <Plus size={13} />
          Add Condition
        </button>
      </div>
    </div>
  );
}

/* ── Permissions Settings ── */
function PermissionsSettings({ field, updateField }: Omit<SettingsProps, 'pushHistory'>) {
  return (
    <div className="settings-section">
      <div className="settings-group settings-group--row">
        <label className="settings-label">Disabled</label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={field.disabled || false}
            onChange={(e) => updateField(field.id, { disabled: e.target.checked })}
          />
          <span className="settings-toggle__track" />
        </label>
      </div>
      <div className="settings-group settings-group--row">
        <label className="settings-label">Read Only</label>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={field.readOnly || false}
            onChange={(e) => updateField(field.id, { readOnly: e.target.checked })}
          />
          <span className="settings-toggle__track" />
        </label>
      </div>
    </div>
  );
}
