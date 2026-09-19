import { FieldKey } from './extraction.types';

export interface FieldConfig {
  key: FieldKey;
  label: string;
  inputType: 'text' | 'tel';
}

// The order here is the order the fields appear on screen.
export const FIELD_CONFIG: FieldConfig[] = [
  { key: 'businessName', label: 'Business name', inputType: 'text' },
  { key: 'taxId', label: 'Tax ID (EIN or SSN)', inputType: 'text' },
  { key: 'addressStreet', label: 'Street address', inputType: 'text' },
  { key: 'addressCity', label: 'City', inputType: 'text' },
  { key: 'addressState', label: 'State', inputType: 'text' },
  { key: 'addressPostalCode', label: 'ZIP / postal code', inputType: 'text' },
  { key: 'phone', label: 'Phone', inputType: 'tel' },
];
