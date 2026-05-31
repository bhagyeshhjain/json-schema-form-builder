import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FIELD_CATEGORIES, FIELD_TYPES } from '../../constants/fieldTypes';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import type { FieldType } from '../../types/schema';
import './FieldPalette.css';

interface FieldPaletteItemProps {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

function FieldPaletteItem({ type, label, icon: Icon }: FieldPaletteItemProps) {
  const { addField } = useFormBuilderStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`palette-item ${isDragging ? 'palette-item--dragging' : ''}`}
      {...listeners}
      {...attributes}
      onClick={() => addField(type)}
    >
      <div className="palette-item__icon">
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <span className="palette-item__label">{label}</span>
      <div className="palette-item__drag-indicator">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
          <circle cx="2" cy="2" r="1.2" />
          <circle cx="6" cy="2" r="1.2" />
          <circle cx="2" cy="7" r="1.2" />
          <circle cx="6" cy="7" r="1.2" />
          <circle cx="2" cy="12" r="1.2" />
          <circle cx="6" cy="12" r="1.2" />
        </svg>
      </div>
    </div>
  );
}

export function FieldPalette() {
  return (
    <aside className="field-palette dark-scrollbar">
      <div className="field-palette__header">
        <h2 className="field-palette__title">Field Palette</h2>
      </div>
      <div className="field-palette__content">
        {FIELD_CATEGORIES.map((category) => {
          const fields = FIELD_TYPES.filter((f) => f.category === category.key);
          if (fields.length === 0) return null;
          return (
            <div key={category.key} className="palette-category">
              <h3 className="palette-category__title">{category.label}</h3>
              <div className="palette-category__items">
                {fields.map((field) => (
                  <FieldPaletteItem
                    key={field.type}
                    type={field.type}
                    label={field.label}
                    icon={field.icon}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
