import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import type { FormField } from '../../types/schema';
import { getFieldConfig } from '../../constants/fieldTypes';
import { getFieldRenderer } from './FieldRenderers/fieldRegistry';
import { useFormBuilderStore } from '../../store/formBuilderStore';

interface CanvasFieldProps {
  field: FormField;
  isSelected: boolean;
}

export function CanvasField({ field, isSelected }: CanvasFieldProps) {
  const { selectField, removeField, duplicateField } = useFormBuilderStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const Renderer = getFieldRenderer(field.type);
  const config = getFieldConfig(field.type);
  const hasConditions = field.conditionalLogic && field.conditionalLogic.conditions.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-field canvas-field--width-${field.width || 'full'} ${isSelected ? 'canvas-field--selected' : ''} ${isDragging ? 'canvas-field--dragging' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        selectField(field.id);
      }}
    >
      {/* Drag Handle */}
      <div className="canvas-field__drag-handle" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>

      {/* Actions */}
      <div className="canvas-field__actions">
        <button
          className="canvas-field__action-btn"
          onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
          title="Duplicate"
        >
          <Copy size={13} />
        </button>
        <button
          className="canvas-field__action-btn canvas-field__action-btn--danger"
          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Field Type Badge */}
      <div className="canvas-field__type-badge">
        {config && <config.icon size={11} />}
        <span>{config?.label || field.type}</span>
      </div>

      {/* Renderer */}
      <div className="canvas-field__content">
        <Renderer field={field} isCanvas={true} />
      </div>

      {/* Conditional Logic Indicator */}
      {hasConditions && (
        <div className="canvas-field__condition-badge">
          {field.conditionalLogic!.action === 'show' ? <Eye size={11} /> : <EyeOff size={11} />}
          <span>
            {field.conditionalLogic!.action === 'show' ? 'Visible' : 'Hidden'} if conditions met
          </span>
        </div>
      )}
    </div>
  );
}
