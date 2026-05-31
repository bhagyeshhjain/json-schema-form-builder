/* ================================================
   Public Library API
   @bhagyeshhjain/json-schema-form-builder
   ================================================ */

// Main component
export { default as FormBuilder } from './App';

// Types
export type {
  FieldType,
  FieldOption,
  FieldCondition,
  ConditionalLogic,
  FieldValidation,
  FormField,
  FormStep,
  FormSettings,
  FormSchema,
  ViewportSize,
  SettingsTab,
  HistoryEntry,
} from './types/schema';

// Store
export { useFormBuilderStore } from './store/formBuilderStore';

// Code generators
export { generateJsonSchema } from './engine/jsonSchemaGenerator';
export { generateZodSchema } from './engine/zodSchemaGenerator';
export { generateReactComponent } from './engine/reactComponentGenerator';

// Export utilities
export { exportAsJson, exportAsZod, exportAsComponent, exportAll } from './utils/exportUtils';
