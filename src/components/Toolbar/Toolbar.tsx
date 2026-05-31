import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Download,
  Settings,
  FileJson,
  FileCode,
  Code2,
  Package,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import type { ViewportSize } from '../../types/schema';
import './Toolbar.css';

export function Toolbar() {
  const {
    schema,
    isPreviewMode,
    viewportSize,
    history,
    historyIndex,
    setPreviewMode,
    setViewportSize,
    setTitle,
    undo,
    redo,
    resetForm,
    importSchema,
  } = useFormBuilderStore();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const viewportOptions: { key: ViewportSize; icon: React.ComponentType<any>; label: string }[] = [
    { key: 'desktop', icon: Monitor, label: 'Desktop' },
    { key: 'tablet', icon: Tablet, label: 'Tablet' },
    { key: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  const handleExport = (type: string) => {
    setShowExportMenu(false);
    const event = new CustomEvent('form-builder-export', { detail: { type } });
    window.dispatchEvent(event);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        importSchema(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="toolbar">
      {/* Left Section */}
      <div className="toolbar__left">
        <div className="toolbar__brand">
          <div className="toolbar__logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#logo-gradient)" />
              <path d="M8 9h8M8 12h6M8 15h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="3" y1="3" x2="21" y2="21">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="toolbar__brand-name">React Schema Form Builder</span>
        </div>

        <div className="toolbar__separator" />

        {/* Form Title */}
        <div className="toolbar__form-info">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              className="toolbar__title-input"
              value={schema.title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            />
          ) : (
            <button className="toolbar__title-btn" onClick={() => setIsEditingTitle(true)}>
              {schema.title}
            </button>
          )}
          <span className="toolbar__version">v{schema.version} ({schema.status})</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="toolbar__center">
        <button
          className={`toolbar__btn ${isPreviewMode ? 'toolbar__btn--active' : ''}`}
          onClick={() => setPreviewMode(!isPreviewMode)}
        >
          <Eye size={15} />
          <span>Preview</span>
        </button>

        <div className="toolbar__separator" />

        <div className="toolbar__viewport-toggle">
          {viewportOptions.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              className={`toolbar__viewport-btn ${viewportSize === key ? 'toolbar__viewport-btn--active' : ''}`}
              onClick={() => setViewportSize(key)}
              title={label}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>

        <div className="toolbar__separator" />

        <button className="toolbar__btn" onClick={undo} disabled={!canUndo} title="Undo">
          <Undo2 size={15} />
          <span>Undo</span>
        </button>
        <button className="toolbar__btn" onClick={redo} disabled={!canRedo} title="Redo">
          <Redo2 size={15} />
          <span>Redo</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="toolbar__right">
        <div className="toolbar__dropdown" ref={exportRef}>
          <button
            className="toolbar__btn toolbar__btn--primary"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={15} />
            <span>Export</span>
          </button>
          {showExportMenu && (
            <div className="toolbar__dropdown-menu animate-fade-in-scale">
              <button className="toolbar__dropdown-item" onClick={() => handleExport('json')}>
                <FileJson size={14} />
                <div>
                  <span>JSON Schema</span>
                  <small>Standard JSON Schema format</small>
                </div>
              </button>
              <button className="toolbar__dropdown-item" onClick={() => handleExport('zod')}>
                <FileCode size={14} />
                <div>
                  <span>Zod Schema</span>
                  <small>TypeScript validation schema</small>
                </div>
              </button>
              <button className="toolbar__dropdown-item" onClick={() => handleExport('component')}>
                <Code2 size={14} />
                <div>
                  <span>React Component</span>
                  <small>Ready-to-use form component</small>
                </div>
              </button>
              <div className="toolbar__dropdown-divider" />
              <button className="toolbar__dropdown-item" onClick={() => handleExport('all')}>
                <Package size={14} />
                <div>
                  <span>Export All</span>
                  <small>Download everything as files</small>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="toolbar__dropdown" ref={settingsRef}>
          <button
            className="toolbar__btn"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <Settings size={15} />
          </button>
          {showSettingsMenu && (
            <div className="toolbar__dropdown-menu toolbar__dropdown-menu--right animate-fade-in-scale">
              <button
                className="toolbar__dropdown-item"
                onClick={() => { fileInputRef.current?.click(); setShowSettingsMenu(false); }}
              >
                <Upload size={14} />
                <div>
                  <span>Import Schema</span>
                  <small>Load from JSON file</small>
                </div>
              </button>
              <div className="toolbar__dropdown-divider" />
              <button
                className="toolbar__dropdown-item toolbar__dropdown-item--danger"
                onClick={() => { if (confirm('Reset form? This cannot be undone.')) { resetForm(); setShowSettingsMenu(false); } }}
              >
                <RotateCcw size={14} />
                <div>
                  <span>Reset Form</span>
                  <small>Clear all fields and start fresh</small>
                </div>
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
    </header>
  );
}
