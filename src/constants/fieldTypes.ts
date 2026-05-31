import {
  Type,
  Hash,
  Mail,
  AlignLeft,
  Lock,
  ChevronDown,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Clock,
  CalendarClock,
  Upload,
  PenTool,
  Heading,
  Minus,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FieldType } from '../types/schema';

export interface FieldTypeConfig {
  type: FieldType;
  label: string;
  icon: LucideIcon;
  category: 'basic' | 'selection' | 'advanced' | 'layout';
  defaultLabel: string;
  hasOptions?: boolean;
}

export const FIELD_TYPES: FieldTypeConfig[] = [
  // Basic Fields
  { type: 'text', label: 'Text', icon: Type, category: 'basic', defaultLabel: 'Text Field' },
  { type: 'number', label: 'Number', icon: Hash, category: 'basic', defaultLabel: 'Number Field' },
  { type: 'email', label: 'Email', icon: Mail, category: 'basic', defaultLabel: 'Email Address' },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft, category: 'basic', defaultLabel: 'Text Area' },
  { type: 'password', label: 'Password', icon: Lock, category: 'basic', defaultLabel: 'Password' },

  // Selection Fields
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, category: 'selection', defaultLabel: 'Select Option', hasOptions: true },
  { type: 'radio', label: 'Radio Group', icon: CircleDot, category: 'selection', defaultLabel: 'Radio Selection', hasOptions: true },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'selection', defaultLabel: 'Checkbox', hasOptions: true },
  { type: 'toggle', label: 'Toggle', icon: ToggleLeft, category: 'selection', defaultLabel: 'Toggle Switch' },

  // Advanced Fields
  { type: 'date', label: 'Date Picker', icon: Calendar, category: 'advanced', defaultLabel: 'Date' },
  { type: 'time', label: 'Time Picker', icon: Clock, category: 'advanced', defaultLabel: 'Time' },
  { type: 'datetime', label: 'Date & Time', icon: CalendarClock, category: 'advanced', defaultLabel: 'Date & Time' },
  { type: 'file', label: 'File Upload', icon: Upload, category: 'advanced', defaultLabel: 'Upload File' },
  { type: 'signature', label: 'Signature', icon: PenTool, category: 'advanced', defaultLabel: 'Signature' },

  // Layout Elements
  { type: 'heading', label: 'Heading', icon: Heading, category: 'layout', defaultLabel: 'Section Heading' },
  { type: 'divider', label: 'Divider', icon: Minus, category: 'layout', defaultLabel: '' },
  { type: 'paragraph', label: 'Paragraph', icon: FileText, category: 'layout', defaultLabel: 'Add your text here...' },
];

export const FIELD_CATEGORIES = [
  { key: 'basic', label: 'Basic Fields' },
  { key: 'selection', label: 'Selection Fields' },
  { key: 'advanced', label: 'Advanced Fields' },
  { key: 'layout', label: 'Layout Elements' },
] as const;

export function getFieldConfig(type: FieldType): FieldTypeConfig | undefined {
  return FIELD_TYPES.find(f => f.type === type);
}
