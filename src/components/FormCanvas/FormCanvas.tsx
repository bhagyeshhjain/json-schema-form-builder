
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutGrid } from 'lucide-react';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { CanvasField } from './CanvasField';
import './FormCanvas.css';

export function FormCanvas() {
  const { schema, selectedFieldId, selectField, viewportSize } = useFormBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

  const fieldIds = schema.fields.map((f) => f.id);

  const viewportClass =
    viewportSize === 'tablet'
      ? 'form-canvas__viewport--tablet'
      : viewportSize === 'mobile'
        ? 'form-canvas__viewport--mobile'
        : '';

  return (
    <div className="form-canvas" onClick={() => selectField(null)}>
      <div className="form-canvas__scroll-area">
        <div className={`form-canvas__viewport ${viewportClass}`}>
          <div
            ref={setNodeRef}
            className={`form-canvas__form ${isOver ? 'form-canvas__form--drag-over' : ''}`}
          >
            {/* Form Title */}
            <div className="form-canvas__form-header">
              <h1 className="form-canvas__form-title">{schema.title || 'Untitled Form'}</h1>
              {schema.description && (
                <p className="form-canvas__form-description">{schema.description}</p>
              )}
            </div>

            {/* Fields */}
            {schema.fields.length === 0 ? (
              <EmptyCanvasState />
            ) : (
              <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                <div className="form-canvas__fields">
                  {schema.fields.map((field) => (
                    <CanvasField
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                    />
                  ))}
                </div>
              </SortableContext>
            )}

            {/* Submit Button Preview */}
            {schema.fields.length > 0 && (
              <div className="form-canvas__submit-area">
                <button className="form-canvas__submit-btn" disabled>
                  {schema.settings.submitButtonText || 'Submit'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCanvasState() {
  return (
    <div className="empty-canvas">
      <div className="empty-canvas__icon">
        <LayoutGrid size={40} strokeWidth={1.2} />
      </div>
      <h3 className="empty-canvas__title">Start Building Your Form</h3>
      <p className="empty-canvas__description">
        Drag fields from the palette on the left and drop them here to begin designing your form.
      </p>
      <div className="empty-canvas__hint">
        <div className="empty-canvas__hint-dot" />
        <span>Drop your first field to get started</span>
      </div>
    </div>
  );
}
