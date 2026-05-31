import { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useFormBuilderStore } from './store/formBuilderStore';
import { Toolbar } from './components/Toolbar/Toolbar';
import { FieldPalette } from './components/FieldPalette/FieldPalette';
import { FormCanvas } from './components/FormCanvas/FormCanvas';
import { FieldSettings } from './components/FieldSettings/FieldSettings';
import { SchemaPanel } from './components/SchemaPanel/SchemaPanel';
import { FormPreview } from './components/Preview/FormPreview';
import { exportAsJson, exportAsZod, exportAsComponent, exportAll } from './utils/exportUtils';
import type { FieldType } from './types/schema';
import './App.css';

function App() {
  const {
    schema,
    isPreviewMode,
    setDragging,
    setPreviewMode,
    addField,
    moveField,
  } = useFormBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Listen for export events from toolbar
  useEffect(() => {
    const handleExport = (e: Event) => {
      const { type } = (e as CustomEvent).detail;
      switch (type) {
        case 'json': exportAsJson(schema); break;
        case 'zod': exportAsZod(schema); break;
        case 'component': exportAsComponent(schema); break;
        case 'all': exportAll(schema); break;
      }
    };
    window.addEventListener('form-builder-export', handleExport);
    return () => window.removeEventListener('form-builder-export', handleExport);
  }, [schema]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useFormBuilderStore.getState().redo();
        } else {
          useFormBuilderStore.getState().undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  const handleDragStart = (_event: DragStartEvent) => {
    setDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(false);
    const { active, over } = event;

    if (!over) return;

    // Dragging from palette to canvas
    if (String(active.id).startsWith('palette-')) {
      const fieldType = (active.data.current as any)?.type as FieldType;
      if (fieldType) {
        // Find insertion index based on drop position
        const overFieldIndex = schema.fields.findIndex((f) => f.id === over.id);
        addField(fieldType, overFieldIndex >= 0 ? overFieldIndex + 1 : undefined);
      }
      return;
    }

    // Reordering within canvas
    if (active.id !== over.id) {
      moveField(String(active.id), String(over.id));
    }
  };

  return (
    <div className="app">
      <Toolbar />

      <div className="app__body">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <FieldPalette />
          <div className="app__main">
            <FormCanvas />
            <SchemaPanel />
          </div>
          <FieldSettings />
        </DndContext>
      </div>

      {/* Preview Overlay */}
      {isPreviewMode && (
        <FormPreview
          schema={schema}
          onClose={() => setPreviewMode(false)}
        />
      )}
    </div>
  );
}

export default App;
