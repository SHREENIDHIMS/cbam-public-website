/** Prints `sha256  file` for every committed sample file, for lib/api/fixtures/upload-manifest.ts. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILES = [
  'northstar-steel-imports.csv',
  'meridian-aluminium.xlsx',
  'supplier-b-messy.xlsx',
  'broker-export-messy.csv',
];

for (const file of FILES) {
  const hash = createHash('sha256')
    .update(readFileSync(join(process.cwd(), 'tests', 'fixtures', file)))
    .digest('hex');
  console.log(`${hash}  ${file}`);
}
