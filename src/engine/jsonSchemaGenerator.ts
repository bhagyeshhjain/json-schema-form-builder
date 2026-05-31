import type { FormSchema, FormField } from '../types/schema';

/**
 * Generate a standard JSON Schema (Draft 2020-12) from the form schema
 */
export function generateJsonSchema(formSchema: FormSchema): object {
  const properties: Record<string, object> = {};
  const required: string[] = [];

  for (const field of formSchema.fields) {
    // Skip layout elements
    if (['heading', 'divider', 'paragraph'].includes(field.type)) continue;

    const prop = fieldToJsonSchemaProperty(field);
    properties[field.fieldKey] = prop;

    if (field.required) {
      required.push(field.fieldKey);
    }
  }

  const schema: Record<string, any> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: formSchema.title,
    description: formSchema.description || undefined,
    type: 'object',
    properties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  // Add conditional dependencies
  const dependencies = generateDependencies(formSchema.fields);
  if (Object.keys(dependencies).length > 0) {
    schema.dependentSchemas = dependencies;
  }

  return schema;
}

function fieldToJsonSchemaProperty(field: FormField): Record<string, any> {
  const prop: Record<string, any> = {};

  switch (field.type) {
    case 'text':
    case 'email':
    case 'textarea':
    case 'password':
      prop.type = 'string';
      if (field.type === 'email') prop.format = 'email';
      if (field.validation?.minLength) prop.minLength = field.validation.minLength;
      if (field.validation?.maxLength) prop.maxLength = field.validation.maxLength;
      if (field.validation?.pattern) prop.pattern = field.validation.pattern;
      break;

    case 'number':
      prop.type = 'number';
      if (field.validation?.min !== undefined) prop.minimum = field.validation.min;
      if (field.validation?.max !== undefined) prop.maximum = field.validation.max;
      break;

    case 'dropdown':
    case 'radio':
      prop.type = 'string';
      if (field.options?.length) {
        prop.enum = field.options.map((o) => o.value);
        prop.enumLabels = field.options.map((o) => o.label);
      }
      break;

    case 'checkbox':
      prop.type = 'array';
      prop.items = {
        type: 'string',
        enum: field.options?.map((o) => o.value) || [],
      };
      prop.uniqueItems = true;
      break;

    case 'toggle':
      prop.type = 'boolean';
      break;

    case 'date':
      prop.type = 'string';
      prop.format = 'date';
      break;

    case 'time':
      prop.type = 'string';
      prop.format = 'time';
      break;

    case 'datetime':
      prop.type = 'string';
      prop.format = 'date-time';
      break;

    case 'file':
      prop.type = 'string';
      prop.contentMediaType = field.accept || '*/*';
      prop.description = `Max file size: ${field.maxFileSize || 5}MB`;
      break;

    case 'signature':
      prop.type = 'string';
      prop.contentEncoding = 'base64';
      prop.description = 'Base64 encoded signature image';
      break;

    default:
      prop.type = 'string';
  }

  // Common properties
  if (field.label) prop.title = field.label;
  if (field.helpText) prop.description = field.helpText;
  if (field.defaultValue) prop.default = field.defaultValue;
  if (field.placeholder) prop['x-placeholder'] = field.placeholder;
  if (field.width) prop['x-ui-width'] = field.width;

  return prop;
}

function generateDependencies(fields: FormField[]): Record<string, any> {
  const deps: Record<string, any> = {};

  for (const field of fields) {
    if (!field.conditionalLogic || field.conditionalLogic.conditions.length === 0) continue;

    const { conditions } = field.conditionalLogic;
    for (const cond of conditions) {
      if (!deps[cond.field]) {
        deps[cond.field] = {
          properties: {},
        };
      }
      // Add a reference to the dependent field
      deps[cond.field].properties[field.fieldKey] = {
        'x-visibleIf': {
          field: cond.field,
          operator: cond.operator,
          value: cond.value,
        },
      };
    }
  }

  return deps;
}
