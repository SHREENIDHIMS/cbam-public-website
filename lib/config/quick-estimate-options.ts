/**
 * Quick estimate answer keys and their labels. Plain data with no schema library, so the browser
 * wizard can use them without loading Zod; lib/config/tools.ts validates the same values.
 */

export const VALUE_BAND_KEYS = [
  'under_25k',
  '25k_50k',
  '50k_100k',
  '100k_500k',
  '500k_2m',
  'over_2m',
  'unknown',
] as const;
export type ValueBandKey = (typeof VALUE_BAND_KEYS)[number];

export const SUPPLIER_BAND_KEYS = ['1', '2_5', '6_20', '21_plus', 'unknown'] as const;
export type SupplierBandKey = (typeof SUPPLIER_BAND_KEYS)[number];

export const ORIGIN_GROUP_KEYS = [
  'china',
  'india',
  'turkey',
  'eu_efta',
  'other_asia',
  'other',
  'unsure',
] as const;
export type OriginGroupKey = (typeof ORIGIN_GROUP_KEYS)[number];

export const LARGE_SHIPMENT_KEYS = ['yes', 'no', 'unsure'] as const;
export type LargeShipmentKey = (typeof LARGE_SHIPMENT_KEYS)[number];

export const VALUE_BANDS = [
  { key: 'under_25k', label: 'Under £25,000', min: 0, max: 25_000 },
  { key: '25k_50k', label: '£25,000 to £50,000', min: 25_000, max: 50_000 },
  { key: '50k_100k', label: '£50,000 to £100,000', min: 50_000, max: 100_000 },
  { key: '100k_500k', label: '£100,000 to £500,000', min: 100_000, max: 500_000 },
  { key: '500k_2m', label: '£500,000 to £2 million', min: 500_000, max: 2_000_000 },
  { key: 'over_2m', label: 'Over £2 million', min: 2_000_000, max: null },
  { key: 'unknown', label: 'I do not know yet', min: null, max: null },
] as const;

export const SUPPLIER_BANDS = [
  { key: '1', label: 'One supplier' },
  { key: '2_5', label: '2 to 5 suppliers' },
  { key: '6_20', label: '6 to 20 suppliers' },
  { key: '21_plus', label: 'More than 20 suppliers' },
  { key: 'unknown', label: 'I do not know yet' },
] as const;

export const ORIGIN_GROUPS = [
  { key: 'china', label: 'China' },
  { key: 'india', label: 'India' },
  { key: 'turkey', label: 'Türkiye' },
  { key: 'eu_efta', label: 'EU or EFTA' },
  { key: 'other_asia', label: 'Other Asia' },
  { key: 'other', label: 'Somewhere else' },
  { key: 'unsure', label: 'Not sure' },
] as const;

export const LARGE_SHIPMENT_OPTIONS = [
  {
    key: 'yes',
    label: 'Yes, now and then',
    description: 'A single shipment can be worth a large share of a year.',
  },
  {
    key: 'no',
    label: 'No, imports are fairly steady',
    description: 'Shipments are similar in size across the year.',
  },
  {
    key: 'unsure',
    label: 'I am not sure',
    description: 'We will say so in the confidence note.',
  },
] as const;
