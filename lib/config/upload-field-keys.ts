/** Field keys only, so analytics can name them without importing the synonym tables. */

export const UPLOAD_FIELD_KEYS = [
  'commodityCode',
  'importDate',
  'netMass',
  'customsValue',
  'originCountry',
  'supplier',
  'description',
  'entryReference',
  'currency',
  'supplierDeclaration',
] as const;
export type UploadFieldKey = (typeof UPLOAD_FIELD_KEYS)[number];
