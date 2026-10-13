import '@/lib/validation/zod-browser';
import { z } from 'zod';
import { UPLOAD_FIELD_KEYS, type UploadFieldKey } from './upload-field-keys';

/**
 * Fields the liability preview reads from an upload, with the heading synonyms used to suggest
 * a column mapping. Synonyms marked `generic` are single common words ("value", "date") that
 * match many headings, so their score is capped and the visitor is asked to check them.
 */

export { UPLOAD_FIELD_KEYS, type UploadFieldKey };

export const FIELD_KINDS = [
  'date',
  'code',
  'text',
  'country',
  'mass',
  'money',
  'currency',
  'declaration',
] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];

export const uploadFieldSchema = z.object({
  key: z.enum(UPLOAD_FIELD_KEYS),
  label: z.string().min(1),
  requirement: z.enum(['required', 'recommended', 'optional']),
  kind: z.enum(FIELD_KINDS),
  synonyms: z.array(z.object({ text: z.string().min(1), generic: z.boolean() })).min(1),
});
export type UploadField = z.infer<typeof uploadFieldSchema>;

const exact = (...texts: string[]) => texts.map((text) => ({ text, generic: false }));
const generic = (...texts: string[]) => texts.map((text) => ({ text, generic: true }));

/** In priority order: earlier fields win score ties. */
export const UPLOAD_FIELDS: readonly UploadField[] = z.array(uploadFieldSchema).parse([
  {
    key: 'commodityCode',
    label: 'Commodity code',
    requirement: 'required',
    kind: 'code',
    synonyms: [
      ...exact('commodity code', 'cn code', 'hs code', 'tariff code', 'comm code', 'taric code'),
      ...generic('commodity'),
    ],
  },
  {
    key: 'importDate',
    label: 'Import date',
    requirement: 'required',
    kind: 'date',
    synonyms: [
      ...exact(
        'import date',
        'date of import',
        'entry date',
        'acceptance date',
        'declaration date',
        'clearance date',
        'arrival date',
      ),
      ...generic('date'),
    ],
  },
  {
    key: 'netMass',
    label: 'Net mass',
    requirement: 'required',
    kind: 'mass',
    synonyms: [
      ...exact('net mass', 'net weight', 'net mass kg', 'net qty'),
      ...generic('mass', 'weight', 'quantity'),
    ],
  },
  {
    key: 'customsValue',
    label: 'Customs value',
    requirement: 'required',
    kind: 'money',
    synonyms: [
      ...exact('customs value', 'statistical value', 'invoice value', 'value gbp', 'item price'),
      ...generic('value'),
    ],
  },
  {
    key: 'originCountry',
    label: 'Origin country',
    requirement: 'recommended',
    kind: 'country',
    synonyms: [
      ...exact('origin country', 'country of origin', 'country origin', 'ctry origin', 'coo'),
      ...generic('origin'),
    ],
  },
  {
    key: 'supplier',
    label: 'Supplier',
    requirement: 'recommended',
    kind: 'text',
    synonyms: exact('supplier', 'supplier name', 'consignor', 'exporter', 'seller', 'manufacturer'),
  },
  {
    key: 'description',
    label: 'Description',
    requirement: 'recommended',
    kind: 'text',
    synonyms: [
      ...exact('description', 'goods description', 'item description', 'product description'),
      ...generic('product'),
    ],
  },
  {
    key: 'entryReference',
    label: 'Entry reference',
    requirement: 'optional',
    kind: 'text',
    synonyms: [
      ...exact(
        'entry reference',
        'entry number',
        'entry no',
        'entry ref',
        'declaration number',
        'declaration no',
        'mrn',
      ),
      ...generic('reference'),
    ],
  },
  {
    key: 'currency',
    label: 'Currency',
    requirement: 'optional',
    kind: 'currency',
    synonyms: exact('currency', 'ccy', 'invoice currency'),
  },
  {
    key: 'supplierDeclaration',
    label: 'Supplier emissions data',
    requirement: 'optional',
    kind: 'declaration',
    synonyms: exact(
      'supplier emissions data',
      'declaration status',
      'emissions declaration',
      'supplier declaration',
      'emissions data',
    ),
  },
]);

const BY_KEY = new Map(UPLOAD_FIELDS.map((field) => [field.key, field]));

export function getUploadField(key: UploadFieldKey): UploadField {
  const field = BY_KEY.get(key);
  if (!field) throw new Error(`Unknown upload field ${key}`);
  return field;
}

export const REQUIRED_FIELD_KEYS = UPLOAD_FIELDS.filter(
  (field) => field.requirement === 'required',
).map((field) => field.key);
