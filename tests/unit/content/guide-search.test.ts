import { describe, expect, it } from 'vitest';
import type { GuideListItem } from '@/lib/content/guide-schema';
import { DEFAULT_FILTERS, filterGuides, isRecent } from '@/lib/content/guide-search';

const guides: GuideListItem[] = [
  {
    slug: 'a',
    title: 'How the threshold works',
    summary: 'Two tests for registration.',
    topic: 'threshold',
    sectors: ['iron_steel'],
    sectorLabels: ['Iron and steel'],
    tags: ['registration', 'look-back'],
    reviewedAt: '2026-10-06',
  },
  {
    slug: 'b',
    title: 'Asking suppliers for data',
    summary: 'What to request from producers.',
    topic: 'suppliers',
    sectors: ['aluminium', 'cement'],
    sectorLabels: ['Aluminium', 'Cement'],
    tags: ['evidence'],
    reviewedAt: '2026-03-01',
  },
];
const TODAY = new Date('2026-10-10T00:00:00Z');

describe('filterGuides', () => {
  it('returns everything by default, newest first', () => {
    expect(filterGuides(guides, DEFAULT_FILTERS, TODAY).map((g) => g.slug)).toEqual(['a', 'b']);
  });

  it('searches title, summary, topic, sector label and tags, requiring every word', () => {
    const find = (query: string) =>
      filterGuides(guides, { ...DEFAULT_FILTERS, query }, TODAY).map((g) => g.slug);
    expect(find('threshold')).toEqual(['a']);
    expect(find('producers')).toEqual(['b']);
    expect(find('suppliers')).toEqual(['b']);
    expect(find('iron and steel')).toEqual(['a']);
    expect(find('look-back')).toEqual(['a']);
    expect(find('threshold evidence')).toEqual([]);
    expect(find('zzz')).toEqual([]);
  });

  it('filters by sector, topic and recently reviewed', () => {
    const slugs = (partial: Partial<typeof DEFAULT_FILTERS>) =>
      filterGuides(guides, { ...DEFAULT_FILTERS, ...partial }, TODAY).map((g) => g.slug);
    expect(slugs({ sector: 'cement' })).toEqual(['b']);
    expect(slugs({ topic: 'threshold' })).toEqual(['a']);
    expect(slugs({ recent: true })).toEqual(['a']);
  });

  it('treats the recent window as inclusive of its last day', () => {
    expect(isRecent('2026-07-12', TODAY, 90)).toBe(true);
    expect(isRecent('2026-07-01', TODAY, 90)).toBe(false);
  });
});
