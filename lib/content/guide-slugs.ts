/**
 * Every guide slug. A closed list so the guide_open analytics event carries no free text; a unit
 * test checks it against content/guides so a new guide cannot be forgotten.
 */
export const GUIDE_SLUGS = [
  'carbon-price-relief-explained',
  'commodity-codes-and-scope',
  'how-the-registration-threshold-works',
  'supplier-emissions-data',
  'what-is-uk-cbam',
] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];
