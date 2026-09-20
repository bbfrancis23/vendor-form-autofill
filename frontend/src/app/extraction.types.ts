// Mirrors backend/src/extraction/extraction.schema.ts. Keep the two in sync by hand.

export type Confidence = 'high' | 'medium' | 'low';

export interface ExtractedField {
  value: string | null;
  confidence: Confidence;
}

export type FieldKey =
  | 'businessName'
  | 'taxId'
  | 'addressStreet'
  | 'addressCity'
  | 'addressState'
  | 'addressPostalCode'
  | 'phone';

export type ExtractionResult = Record<FieldKey, ExtractedField>;
export type FormValues = Record<FieldKey, string>;
