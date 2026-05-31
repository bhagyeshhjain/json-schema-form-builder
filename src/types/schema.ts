/* ================================================
   Core Type Definitions
   ================================================ */

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'textarea'
  | 'password'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'signature'
  | 'heading'
  | 'divider'
  | 'paragraph';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: string;
}

export interface ConditionalLogic {
  action: 'show' | 'hide';
  operator: 'and' | 'or';
  conditions: FieldCondition[];
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  customMessage?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  fieldKey: string;
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helpText?: string;
  width?: 'full' | 'half' | 'third';

  // Validation
  validation?: FieldValidation;

  // Options (dropdown, radio, checkbox)
  options?: FieldOption[];

  // Conditional Logic
  conditionalLogic?: ConditionalLogic;

  // File upload specific
  accept?: string;
  maxFileSize?: number;

  // Heading / paragraph
  content?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
}

export interface FormStep {
  id: string;
  title: string;
  fieldIds: string[];
}

export interface FormSettings {
  submitButtonText: string;
  showProgressBar: boolean;
  layout: 'single' | 'multi-step';
  steps?: FormStep[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  version: string;
  status: 'draft' | 'published';
  fields: FormField[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export type SettingsTab = 'general' | 'validation' | 'conditional' | 'permissions';

export interface HistoryEntry {
  fields: FormField[];
  title: string;
  timestamp: number;
}
