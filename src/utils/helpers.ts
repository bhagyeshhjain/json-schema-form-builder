import { nanoid } from 'nanoid';
import type { FormField, FieldType, FieldOption } from '../types/schema';

/**
 * Convert a label string to camelCase field key
 */
export function labelToFieldKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

/**
 * Create a new form field with defaults
 */
export function createField(type: FieldType, label: string, existingKeys: string[] = []): FormField {
  let fieldKey = labelToFieldKey(label);

  // Ensure unique key
  let counter = 1;
  let uniqueKey = fieldKey;
  while (existingKeys.includes(uniqueKey)) {
    uniqueKey = `${fieldKey}${counter}`;
    counter++;
  }

  const baseField: FormField = {
    id: nanoid(10),
    type,
    label,
    fieldKey: uniqueKey,
    placeholder: '',
    defaultValue: '',
    required: false,
    width: 'full',
  };

  // Add default options for selection types
  if (['dropdown', 'radio', 'checkbox'].includes(type)) {
    baseField.options = getDefaultOptions(type);
  }

  // Heading defaults
  if (type === 'heading') {
    baseField.headingLevel = 'h2';
    baseField.content = label;
  }

  // Paragraph defaults
  if (type === 'paragraph') {
    baseField.content = label;
  }

  // File defaults
  if (type === 'file') {
    baseField.accept = '*/*';
    baseField.maxFileSize = 5;
  }

  return baseField;
}

function getDefaultOptions(type: FieldType): FieldOption[] {
  if (type === 'checkbox') {
    return [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ];
  }
  return [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format a date for version history
 */
export function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

/**
 * Generate a semantic version string
 */
export function bumpVersion(version: string): string {
  const parts = version.split('.').map(Number);
  parts[parts.length - 1]++;
  return parts.join('.');
}
