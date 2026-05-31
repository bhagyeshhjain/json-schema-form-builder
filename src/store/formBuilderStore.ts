import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  FormSchema,
  FormField,
  FieldType,
  ViewportSize,
  SettingsTab,
  HistoryEntry,
} from '../types/schema';
import { createField, deepClone } from '../utils/helpers';
import { FIELD_TYPES } from '../constants/fieldTypes';

interface FormBuilderState {
  schema: FormSchema;
  selectedFieldId: string | null;
  isDragging: boolean;
  isPreviewMode: boolean;
  viewportSize: ViewportSize;
  activeSettingsTab: SettingsTab;
  isSchemaPanelOpen: boolean;
  schemaPanelTab: 'json' | 'logic' | 'history';
  history: HistoryEntry[];
  historyIndex: number;

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  updateSettings: (settings: Partial<FormSchema['settings']>) => void;
  addField: (type: FieldType, index?: number) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  moveField: (activeId: string, overId: string) => void;
  duplicateField: (id: string) => void;
  selectField: (id: string | null) => void;
  setDragging: (dragging: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  setViewportSize: (size: ViewportSize) => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;
  toggleSchemaPanel: () => void;
  setSchemaPanelTab: (tab: 'json' | 'logic' | 'history') => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  importSchema: (schema: FormSchema) => void;
  resetForm: () => void;
}

function createDefaultSchema(): FormSchema {
  return {
    id: nanoid(10),
    title: 'Untitled Form',
    description: '',
    version: '1.0',
    status: 'draft',
    fields: [],
    settings: {
      submitButtonText: 'Submit',
      showProgressBar: false,
      layout: 'single',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const MAX_HISTORY = 50;

function loadFromStorage(): FormSchema | null {
  try {
    const saved = localStorage.getItem('form-builder-schema');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(schema: FormSchema) {
  try {
    localStorage.setItem('form-builder-schema', JSON.stringify(schema));
  } catch { /* ignore */ }
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  schema: loadFromStorage() || createDefaultSchema(),
  selectedFieldId: null,
  isDragging: false,
  isPreviewMode: false,
  viewportSize: 'desktop',
  activeSettingsTab: 'general',
  isSchemaPanelOpen: true,
  schemaPanelTab: 'json',
  history: [],
  historyIndex: -1,

  setTitle: (title) => {
    set((state) => {
      const schema = { ...state.schema, title, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return { schema };
    });
  },

  setDescription: (description) => {
    set((state) => {
      const schema = { ...state.schema, description, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return { schema };
    });
  },

  updateSettings: (settings) => {
    set((state) => {
      const schema = {
        ...state.schema,
        settings: { ...state.schema.settings, ...settings },
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(schema);
      return { schema };
    });
  },

  addField: (type, index) => {
    const state = get();
    state.pushHistory();
    const existingKeys = state.schema.fields.map((f) => f.fieldKey);
    const fieldConfig = FIELD_TYPES.find((f) => f.type === type);
    const label = fieldConfig?.defaultLabel || 'New Field';
    const field = createField(type, label, existingKeys);

    set((state) => {
      const fields = [...state.schema.fields];
      if (index !== undefined && index >= 0) {
        fields.splice(index, 0, field);
      } else {
        fields.push(field);
      }
      const schema = { ...state.schema, fields, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return { schema, selectedFieldId: field.id };
    });
  },

  removeField: (id) => {
    const state = get();
    state.pushHistory();
    set((state) => {
      const fields = state.schema.fields.filter((f) => f.id !== id);
      const schema = { ...state.schema, fields, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return {
        schema,
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      };
    });
  },

  updateField: (id, updates) => {
    set((state) => {
      const fields = state.schema.fields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      );
      const schema = { ...state.schema, fields, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return { schema };
    });
  },

  moveField: (activeId, overId) => {
    if (activeId === overId) return;
    const state = get();
    state.pushHistory();
    set((state) => {
      const fields = [...state.schema.fields];
      const oldIndex = fields.findIndex((f) => f.id === activeId);
      const newIndex = fields.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const [moved] = fields.splice(oldIndex, 1);
      fields.splice(newIndex, 0, moved);
      const schema = { ...state.schema, fields, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return { schema };
    });
  },

  duplicateField: (id) => {
    const state = get();
    state.pushHistory();
    set((state) => {
      const fieldIndex = state.schema.fields.findIndex((f) => f.id === id);
      if (fieldIndex === -1) return state;
      const original = state.schema.fields[fieldIndex];
      const clone = deepClone(original);
      clone.id = nanoid(10);
      clone.fieldKey = `${original.fieldKey}Copy`;
      clone.label = `${original.label} (Copy)`;
      const fields = [...state.schema.fields];
      fields.splice(fieldIndex + 1, 0, clone);
      const schema = { ...state.schema, fields, updatedAt: new Date().toISOString() };
      saveToStorage(schema);
      return { schema, selectedFieldId: clone.id };
    });
  },

  selectField: (id) => set({ selectedFieldId: id, activeSettingsTab: 'general' }),

  setDragging: (isDragging) => set({ isDragging }),
  setPreviewMode: (isPreviewMode) => set({ isPreviewMode, selectedFieldId: null }),
  setViewportSize: (viewportSize) => set({ viewportSize }),
  setActiveSettingsTab: (activeSettingsTab) => set({ activeSettingsTab }),
  toggleSchemaPanel: () => set((s) => ({ isSchemaPanelOpen: !s.isSchemaPanelOpen })),
  setSchemaPanelTab: (schemaPanelTab) => set({ schemaPanelTab }),

  pushHistory: () => {
    set((state) => {
      const entry: HistoryEntry = {
        fields: deepClone(state.schema.fields),
        title: state.schema.title,
        timestamp: Date.now(),
      };
      const history = state.history.slice(0, state.historyIndex + 1);
      history.push(entry);
      if (history.length > MAX_HISTORY) history.shift();
      return { history, historyIndex: history.length - 1 };
    });
  },

  undo: () => {
    const { history, historyIndex, schema } = get();
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    const updatedSchema = { ...schema, fields: deepClone(entry.fields), updatedAt: new Date().toISOString() };
    saveToStorage(updatedSchema);
    set({ schema: updatedSchema, historyIndex: historyIndex - 1, selectedFieldId: null });
  },

  redo: () => {
    const { history, historyIndex, schema } = get();
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    if (nextIndex + 1 < history.length) {
      const entry = history[nextIndex + 1];
      const updatedSchema = { ...schema, fields: deepClone(entry.fields), updatedAt: new Date().toISOString() };
      saveToStorage(updatedSchema);
      set({ schema: updatedSchema, historyIndex: nextIndex });
    } else {
      set({ historyIndex: nextIndex });
    }
  },

  importSchema: (imported) => {
    const state = get();
    state.pushHistory();
    saveToStorage(imported);
    set({ schema: imported, selectedFieldId: null });
  },

  resetForm: () => {
    const state = get();
    state.pushHistory();
    const schema = createDefaultSchema();
    saveToStorage(schema);
    set({ schema, selectedFieldId: null });
  },
}));

if (typeof window !== 'undefined') {
  (window as any).useFormBuilderStore = useFormBuilderStore;
}
