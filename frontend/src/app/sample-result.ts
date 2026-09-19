import { ExtractionResult } from './extraction.types';

// Temporary sample data so the form can be built before #11 calls the real API.
// It includes a medium- and a low-confidence field and an empty one, for #10.
export const SAMPLE_RESULT: ExtractionResult = {
  businessName: { value: 'Northwind Supply Co., LLC', confidence: 'high' },
  taxId: { value: '98-7654321', confidence: 'high' },
  addressStreet: { value: '4821 Cedar Ridge Road, Suite 210', confidence: 'high' },
  addressCity: { value: 'Austin', confidence: 'medium' },
  addressState: { value: 'TX', confidence: 'high' },
  addressPostalCode: { value: null, confidence: 'low' },
  phone: { value: '(512) 555-0142', confidence: 'low' },
};
