import { describe, expect, it } from 'vitest';
import { DECISION_KINDS, buildWorkedExample, countDecisions } from '@/lib/content/worked-example';

describe('worked example', () => {
  const { files } = buildWorkedExample();
  const [a, b] = files;

  it('derives Supplier A: mostly valid with one rejected row', () => {
    expect(a.counts).toMatchObject({ rowsFound: 8, included: 7, rejected: 1, needsReview: 0 });
    expect(a.rows.at(-1)).toMatchObject({ rowNumber: 9, outcome: 'rejected', kind: 'rejected' });
  });

  it('derives Supplier B: the messy cases come from the engine, not by hand', () => {
    expect(b.sheetNote).toMatch(/Cover.*Lines/);
    expect(b.skippedAbove).toBe(2);
    expect(b.counts).toMatchObject({
      rowsFound: 6,
      included: 4,
      normalised: 4,
      needsReview: 1,
      totalRowsExcluded: 1,
    });
    const text = b.decisions.map((d) => `${d.kind}|${d.saw}|${d.did}`).join('\n');
    expect(text).toMatch(/needs_review\|Comodity code/);
    expect(text).toMatch(/Decimal commas found in Net mass/);
    expect(text).toMatch(/normalised\|12,5 t/);
    expect(text).toMatch(/needs_review\|6 bags/);
    expect(text).toMatch(/total row/i);
    expect(text).toMatch(/detected\|Unverified/);
  });

  it('puts something in every one of the four outcomes', () => {
    const counts = countDecisions(files);
    for (const kind of DECISION_KINDS) expect(counts[kind], kind).toBeGreaterThan(0);
  });
});
