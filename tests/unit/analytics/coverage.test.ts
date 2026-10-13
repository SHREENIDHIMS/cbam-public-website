import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analyticsEventSchemas, isValidEvent } from '@/lib/analytics/events';
import { GUIDE_SLUGS } from '@/lib/content/guide-slugs';

/** MASTER_PROMPT 33: the event interface covers these actions and carries nothing sensitive. */
const REQUIRED_EVENTS = [
  'cta_click',
  'wizard_start',
  'wizard_complete',
  'upload_start',
  'upload_complete',
  'upload_failed',
  'guide_open',
  'rate_alert_subscribed',
  'contact_submitted',
  'sign_in_click',
] as const;

/**
 * The only property names any event may use. Adding one is a deliberate act: it must not carry
 * customs rows, values, supplier names, file contents or private inputs.
 */
const ALLOWED_PROPERTY_NAMES = new Set([
  'location',
  'cta',
  'step',
  'status',
  'backward',
  'forward',
  'lumpy',
  'fileType',
  'rowBand',
  'reason',
  'field',
  'confidence',
  'isDemo',
  'tool',
  'slug',
  'kind',
]);

const specs = analyticsEventSchemas as Record<
  string,
  Record<string, readonly string[] | 'boolean'>
>;

describe('analytics coverage (section 33)', () => {
  it('has an event for every required action', () => {
    for (const name of REQUIRED_EVENTS) {
      expect(Object.keys(specs), name).toContain(name);
    }
  });

  it('uses only allow-listed property names', () => {
    for (const [event, spec] of Object.entries(specs)) {
      for (const field of Object.keys(spec)) {
        expect(ALLOWED_PROPERTY_NAMES.has(field), `${event}.${field}`).toBe(true);
      }
    }
  });

  it('allows only short identifier tokens as values, never free text', () => {
    for (const [event, spec] of Object.entries(specs)) {
      for (const [field, rule] of Object.entries(spec)) {
        if (rule === 'boolean') continue;
        for (const value of rule) {
          expect(value, `${event}.${field}`).toMatch(/^[A-Za-z0-9_-]{1,80}$/);
        }
      }
    }
  });

  it('rejects an event that carries a sensitive extra field or an unlisted value', () => {
    const base = { fileType: 'csv' };
    expect(isValidEvent('upload_start', base)).toBe(true);
    expect(isValidEvent('upload_start', { ...base, fileName: 'ledger-2026.csv' })).toBe(false);
    expect(isValidEvent('upload_start', { fileType: 'ledger-2026.csv' })).toBe(false);
    expect(isValidEvent('upload_complete', { rowBand: 'under_100', rows: 42 })).toBe(false);
    expect(isValidEvent('contact_submitted', { kind: 'broker', email: 'a@b.test' })).toBe(false);
    expect(isValidEvent('guide_open', { slug: 'not-a-guide' })).toBe(false);
    expect(isValidEvent('guide_open', { slug: GUIDE_SLUGS[0] })).toBe(true);
  });

  it('lists exactly the guides that exist', () => {
    const files = readdirSync(join(process.cwd(), 'content', 'guides'))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''))
      .sort();
    expect([...GUIDE_SLUGS].sort()).toEqual(files);
  });
});
