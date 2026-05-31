import React from 'react';
import type { FormField } from '../../../types/schema';
import {
  TextFieldRenderer,
  NumberFieldRenderer,
  EmailFieldRenderer,
  TextareaFieldRenderer,
  PasswordFieldRenderer,
  DropdownFieldRenderer,
  RadioGroupRenderer,
  CheckboxRenderer,
  ToggleFieldRenderer,
  DatePickerRenderer,
  TimePickerRenderer,
  DateTimePickerRenderer,
  FileUploadRenderer,
  SignatureRenderer,
  HeadingRenderer,
  DividerRenderer,
  ParagraphRenderer,
} from './index';

type RendererComponent = React.ComponentType<{ field: FormField; isCanvas?: boolean }>;

const FIELD_REGISTRY: Record<string, RendererComponent> = {
  text: TextFieldRenderer,
  number: NumberFieldRenderer,
  email: EmailFieldRenderer,
  textarea: TextareaFieldRenderer,
  password: PasswordFieldRenderer,
  dropdown: DropdownFieldRenderer,
  radio: RadioGroupRenderer,
  checkbox: CheckboxRenderer,
  toggle: ToggleFieldRenderer,
  date: DatePickerRenderer,
  time: TimePickerRenderer,
  datetime: DateTimePickerRenderer,
  file: FileUploadRenderer,
  signature: SignatureRenderer,
  heading: HeadingRenderer,
  divider: DividerRenderer,
  paragraph: ParagraphRenderer,
};

export function getFieldRenderer(type: string): RendererComponent {
  return FIELD_REGISTRY[type] || TextFieldRenderer;
}
