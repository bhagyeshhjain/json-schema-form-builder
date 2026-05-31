import { useState } from 'react';
import { ChevronUp, ChevronDown, Copy, Check, FileJson, GitBranch, Clock } from 'lucide-react';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { generateJsonSchema } from '../../engine/jsonSchemaGenerator';
import { generateZodSchema } from '../../engine/zodSchemaGenerator';
import { formatTimestamp } from '../../utils/helpers';
import './SchemaPanel.css';

export function SchemaPanel() {
  const {
    schema,
    isSchemaPanelOpen,
    schemaPanelTab,
    toggleSchemaPanel,
    setSchemaPanelTab,
    history,
  } = useFormBuilderStore();

  const [outputFormat, setOutputFormat] = useState<'json' | 'typescript'>('json');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { key: 'json' as const, label: 'Schema JSON', icon: FileJson },
    { key: 'logic' as const, label: 'Logic Rules', icon: GitBranch },
    { key: 'history' as const, label: 'Version History', icon: Clock },
  ];

  const getSchemaOutput = () => {
    if (outputFormat === 'typescript') {
      return generateZodSchema(schema);
    }
    return JSON.stringify(generateJsonSchema(schema), null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSchemaOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fieldsWithLogic = schema.fields.filter(
    (f) => f.conditionalLogic && f.conditionalLogic.conditions.length > 0
  );

  return (
    <div className={`schema-panel ${isSchemaPanelOpen ? 'schema-panel--open' : ''}`}>
      {/* Toggle Bar */}
      <div className="schema-panel__toggle-bar" onClick={toggleSchemaPanel}>
        <div className="schema-panel__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`schema-panel__tab ${schemaPanelTab === tab.key ? 'schema-panel__tab--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSchemaPanelTab(tab.key);
                if (!isSchemaPanelOpen) toggleSchemaPanel();
              }}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="schema-panel__toggle-actions">
          {schemaPanelTab === 'json' && isSchemaPanelOpen && (
            <div className="schema-panel__format-toggle">
              <button
                className={`schema-panel__format-btn ${outputFormat === 'json' ? 'schema-panel__format-btn--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setOutputFormat('json'); }}
              >
                JSON Schema
              </button>
              <button
                className={`schema-panel__format-btn ${outputFormat === 'typescript' ? 'schema-panel__format-btn--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setOutputFormat('typescript'); }}
              >
                TypeScript / Zod
              </button>
            </div>
          )}
          <button className="schema-panel__chevron" onClick={toggleSchemaPanel}>
            {isSchemaPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isSchemaPanelOpen && (
        <div className="schema-panel__content">
          {schemaPanelTab === 'json' && (
            <div className="schema-panel__code-container">
              <button className="schema-panel__copy-btn" onClick={handleCopy}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <pre className="schema-panel__code">
                <code>{getSchemaOutput()}</code>
              </pre>
            </div>
          )}

          {schemaPanelTab === 'logic' && (
            <div className="schema-panel__logic">
              {fieldsWithLogic.length === 0 ? (
                <div className="schema-panel__empty">
                  <GitBranch size={20} />
                  <p>No conditional logic rules defined yet.</p>
                  <small>Select a field and add conditions in the Conditional Logic tab.</small>
                </div>
              ) : (
                <div className="logic-rules-list">
                  {fieldsWithLogic.map((field) => (
                    <div key={field.id} className="logic-rule">
                      <div className="logic-rule__header">
                        <span className="logic-rule__field-name">{field.label}</span>
                        <span className={`logic-rule__action logic-rule__action--${field.conditionalLogic!.action}`}>
                          {field.conditionalLogic!.action}
                        </span>
                      </div>
                      <div className="logic-rule__conditions">
                        {field.conditionalLogic!.conditions.map((cond, i) => (
                          <div key={i} className="logic-rule__condition">
                            {i > 0 && (
                              <span className="logic-rule__operator">
                                {field.conditionalLogic!.operator.toUpperCase()}
                              </span>
                            )}
                            <code>
                              {cond.field} {cond.operator} {cond.value ? `"${cond.value}"` : ''}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {schemaPanelTab === 'history' && (
            <div className="schema-panel__history">
              {history.length === 0 ? (
                <div className="schema-panel__empty">
                  <Clock size={20} />
                  <p>No history entries yet.</p>
                  <small>Changes will be recorded as you build your form.</small>
                </div>
              ) : (
                <div className="history-list">
                  {[...history].reverse().map((entry, i) => (
                    <div key={i} className="history-entry">
                      <div className="history-entry__dot" />
                      <div className="history-entry__info">
                        <span className="history-entry__time">{formatTimestamp(entry.timestamp)}</span>
                        <span className="history-entry__detail">{entry.fields.length} field(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
