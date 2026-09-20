import { FieldKey } from './extraction.types';

export interface FieldConfig {
  key: FieldKey;
  label: string;
  inputType: 'text' | 'tel';
  required?: boolean;
  /** If set, a non-empty value must match this pattern */
  pattern?: RegExp;
  /** Shown when the value does not match this pattern */
  patternMessage?: string;
}

// The order here is the order the fields appear on screen.
export const FIELD_CONFIG: FieldConfig[] = [
  { key: 'businessName', label: 'Business name', inputType: 'text', required: true },
  {
    key: 'taxId',
    label: 'Tax ID (EIN or SSN)',
    inputType: 'text',
    pattern: /^(\d{2}-\d{7}|\d{3}-\d{2}-\d{4}|\d{9})$/,
    patternMessage: 'Use an EIN like 12-3456789 or an SSN like 123-45-6789',
  },
  { key: 'addressStreet', label: 'Street address', inputType: 'text' },
  { key: 'addressCity', label: 'City', inputType: 'text' },
  { key: 'addressState', label: 'State', inputType: 'text' },
  {
    key: 'addressPostalCode',
    label: 'ZIP / postal code',
    inputType: 'text',
    pattern: /^\d{5}(-\d{4})?$/,
    patternMessage: 'Use a 5-digit ZIP code like 78701, or 78701-1234',
  },
  {
    key: 'phone',
    label: 'Phone',
    inputType: 'tel',
    // The lookahead requires 10 to 15 digits in total; the rest limits which characters are allowed.
    pattern: /^(?=(?:\D*\d){10,15}\D*$)\+?[\d\s().-]+$/,
    patternMessage: 'Enter a phone number with 10 to 15 digits, like (512) 555-0142',
  },
];
