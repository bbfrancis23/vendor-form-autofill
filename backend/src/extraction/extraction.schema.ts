import { z } from 'zod';

export const ConfidenceSchema = z
  .enum(['high', 'medium', 'low'])
  .describe(
    'How sure you are about the value: "high" if the document states it clearly, "medium" if you had to infer or interpret it, "low" if it is a guess, unclear, or missing.',
  );

// Every extracted field has the same shape: the value plus how confident we are in it.
function field(description: string) {
  return z.object({
    value: z
      .string()
      .nullable()
      .describe(
        `${description}. Use null if the document does not contain it.`,
      ),
    confidence: ConfidenceSchema,
  });
}

/**
 * The fields we ask Claude to extract from a vendor document (W-9, invoice, ...).
 *
 * Every field is `{ value, confidence }`:
 *  - value: the text found in the document, or null if it is not there
 *  - confidence: "high" | "medium" | "low" - the UI flags anything that is not "high"
 *
 * Example: { businessName: { value: 'Acme LLC', confidence: 'high' },
 *            phone: { value: null, confidence: 'low' }, ... }
 */

export const ExtractedFieldsSchema = z.object({
  businessName: field('The legal business name'),
  taxId: field(
    'The tax ID (EIN or SSN), formatted as it appears in the document',
  ),
  addressStreet: field('Street address, including any suite or unit number'),
  addressCity: field('City'),
  addressState: field('Two-letter US state code'),
  addressPostalCode: field('ZIP or postal code'),
  phone: field('Phone number'),
});

export type Confidence = z.infer<typeof ConfidenceSchema>;
export type ExtractedFields = z.infer<typeof ExtractedFieldsSchema>;
