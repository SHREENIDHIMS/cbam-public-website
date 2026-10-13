// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildFixturePreview } from '@/lib/api/fixtures/liability-previews';
import {
  FIXTURE_FILE_HASHES,
  FIXTURE_FILE_NAMES,
  FIXTURE_KEYS,
} from '@/lib/api/fixtures/upload-manifest';

describe('upload manifest', () => {
  it('matches the SHA-256 of every committed sample file', () => {
    for (const [hash, key] of Object.entries(FIXTURE_FILE_HASHES)) {
      const bytes = readFileSync(join(process.cwd(), 'tests', 'fixtures', FIXTURE_FILE_NAMES[key]));
      expect(createHash('sha256').update(bytes).digest('hex'), key).toBe(hash);
    }
  });

  it('has a hash and a preview for every sample key', () => {
    const hashed = Object.values(FIXTURE_FILE_HASHES).sort();
    expect(hashed).toEqual(FIXTURE_KEYS.filter((key) => key !== 'demo').sort());
    for (const key of FIXTURE_KEYS) expect(buildFixturePreview(key).fixtureKey).toBe(key);
  });
});
