import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOTS = [
  'components/tools',
  'components/results',
  'app/(marketing)/exposure-check',
  'app/(marketing)/quick-estimate',
  'app/(marketing)/threshold-checker',
  'app/(marketing)/liability-preview',
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('tool components', () => {
  it('contain no typed threshold, start year or pound amounts', () => {
    for (const path of ROOTS.flatMap(files)) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/50,000|50000|2027|£\d/);
    }
  });
});
