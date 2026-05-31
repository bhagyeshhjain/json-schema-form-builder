import type { FormSchema } from '../types/schema';
import { generateJsonSchema } from '../engine/jsonSchemaGenerator';
import { generateZodSchema } from '../engine/zodSchemaGenerator';
import { generateReactComponent } from '../engine/reactComponentGenerator';

function downloadFile(content: string, filename: string, type: string = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsJson(schema: FormSchema) {
  const jsonSchema = generateJsonSchema(schema);
  downloadFile(JSON.stringify(jsonSchema, null, 2), `${schema.title.toLowerCase().replace(/\s+/g, '-')}-schema.json`);
}

export function exportAsZod(schema: FormSchema) {
  const zodCode = generateZodSchema(schema);
  downloadFile(zodCode, `${schema.title.toLowerCase().replace(/\s+/g, '-')}-validation.ts`, 'text/typescript');
}

export function exportAsComponent(schema: FormSchema) {
  const componentCode = generateReactComponent(schema);
  downloadFile(componentCode, `${sanitize(schema.title)}.tsx`, 'text/typescript');
}

export function exportFormSchema(schema: FormSchema) {
  downloadFile(JSON.stringify(schema, null, 2), `${schema.title.toLowerCase().replace(/\s+/g, '-')}-form-builder.json`);
}

export function exportAll(schema: FormSchema) {
  exportAsJson(schema);
  setTimeout(() => exportAsZod(schema), 300);
  setTimeout(() => exportAsComponent(schema), 600);
  setTimeout(() => exportFormSchema(schema), 900);
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '') || 'GeneratedForm';
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
