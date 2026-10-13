import { FIXTURE_KEYS, type FixtureKey } from '../schemas';

export { FIXTURE_KEYS };
export type { FixtureKey };

/**
 * SHA-256 of each committed sample file in tests/fixtures, mapped to its pre-computed preview.
 * Regenerate with `npm run fixtures:hash` (a unit test recomputes these from the files).
 * Any other file hashes to something not listed here and gets a clearly labelled demo result.
 */
export const FIXTURE_FILE_HASHES: Readonly<Record<string, Exclude<FixtureKey, 'demo'>>> = {
  af5979990133dfb85d6959799c8e899c8533b180ec62b13a1b3b7fe7a4703dd6: 'northstar',
  b0c9832e40a8736d03cfe54e3dd817a42ea0925c05916c3d9e82f82b963cf0df: 'meridian',
  '653018644556260fb375506565f9ac7ae606f116d0991fe05814c992c4698abc': 'supplier_b',
  '0f7ee336ffcd9012782ca24c69ab18f764745ae4288ed3da259d38c7537a6a44': 'broker_export',
};

export const FIXTURE_FILE_NAMES: Readonly<Record<Exclude<FixtureKey, 'demo'>, string>> = {
  northstar: 'northstar-steel-imports.csv',
  meridian: 'meridian-aluminium.xlsx',
  supplier_b: 'supplier-b-messy.xlsx',
  broker_export: 'broker-export-messy.csv',
};
