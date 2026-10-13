/** Sector keys as plain data, so browser code can use them without loading a schema library. */
export const SECTOR_KEYS = [
  'aluminium',
  'cement',
  'fertilisers',
  'hydrogen',
  'iron_steel',
] as const;
export type SectorKey = (typeof SECTOR_KEYS)[number];
