import { describe, expect, it } from 'vitest';
import { checkDataRows, discoverHeadings, pickSheet } from '@/lib/upload/headings';
import type { Cell } from '@/lib/upload/types';

const HEADER: Cell[] = ['Entry date', 'Commodity code', 'Net mass', 'Customs value'];
const LINE: Cell[] = ['2027-01-12', '7208390000', 48000, 31800];

describe('discoverHeadings', () => {
  it('finds a heading on row 1', () => {
    const result = discoverHeadings([HEADER, LINE]);
    expect(result.ok && result.value).toMatchObject({
      headerRowIndex: 0,
      skippedAbove: 0,
      headers: ['Entry date', 'Commodity code', 'Net mass', 'Customs value'],
    });
    expect(result.ok && result.value.dataRows).toEqual([{ rowNumber: 2, cells: LINE }]);
  });

  it('skips title and blank rows above the headings and reports them', () => {
    const result = discoverHeadings([['Shipments for 2027'], [null, null], HEADER, LINE]);
    expect(result.ok && result.value.skippedAbove).toBe(2);
    expect(result.ok && result.value.dataRows[0]?.rowNumber).toBe(4);
  });

  it('drops blank data rows and counts them', () => {
    const result = discoverHeadings([HEADER, LINE, [null, ''], [], LINE]);
    expect(result.ok && result.value.blankRowsSkipped).toBe(2);
    expect(result.ok && result.value.dataRows.map((row) => row.rowNumber)).toEqual([2, 5]);
  });

  it('needs at least three recognisable headings', () => {
    expect(discoverHeadings([['Entry date', 'Commodity code'], LINE])).toEqual({
      ok: false,
      error: 'no_headings',
    });
    expect(discoverHeadings([['Alpha', 'Beta', 'Gamma'], LINE]).ok).toBe(false);
  });

  it('only scans the first rows for the headings', () => {
    const filler: Cell[][] = Array.from({ length: 25 }, () => ['x']);
    expect(discoverHeadings([...filler, HEADER, LINE]).ok).toBe(false);
  });
});

describe('pickSheet', () => {
  it('uses the first sheet when it has headings', () => {
    const picked = pickSheet([
      { name: 'Imports', rows: [HEADER, LINE] },
      { name: 'Notes', rows: [['Notes']] },
    ]);
    expect(picked.ok && picked.value.sheetIndex).toBe(0);
    expect(picked.ok && picked.value.switchedFrom).toBeNull();
  });

  it('switches to the first sheet that has headings and says so', () => {
    const picked = pickSheet([
      { name: 'Cover', rows: [['Supplier B shipment file']] },
      { name: 'Lines', rows: [HEADER, LINE] },
    ]);
    expect(picked.ok && picked.value.sheetIndex).toBe(1);
    expect(picked.ok && picked.value.switchedFrom).toEqual({ from: 'Cover', to: 'Lines' });
  });

  it('fails when no sheet has headings', () => {
    expect(pickSheet([{ name: 'A', rows: [['x']] }])).toEqual({ ok: false, error: 'no_headings' });
  });
});

describe('checkDataRows', () => {
  const headings = (count: number) => {
    const result = discoverHeadings([HEADER, ...Array.from({ length: count }, () => LINE)]);
    if (!result.ok) throw new Error('setup');
    return result.value;
  };

  it('reports no data rows and the row limit with the count', () => {
    expect(checkDataRows(headings(0))).toEqual({ ok: false, error: 'no_data_rows' });
    expect(checkDataRows(headings(5))).toEqual({ ok: true });
    expect(checkDataRows(headings(5001))).toEqual({ ok: false, error: 'row_limit', count: 5001 });
    expect(checkDataRows(headings(5000))).toEqual({ ok: true });
  });
});
