import { describe, expect, it } from 'vitest';
import { suggestMapping } from '@/lib/upload/column-matching';
import { validationHeading } from '@/lib/upload/issue-copy';
import type { Cell } from '@/lib/upload/types';
import { validateRows } from '@/lib/upload/validate-rows';

const HEADERS = [
  'Entry date',
  'Commodity code',
  'Net mass',
  'Customs value',
  'Country of origin',
  'Supplier',
  'Supplier emissions data',
  'Currency',
];

function run(rows: Cell[][], massUnit: 'kg' | 'tonnes' = 'kg') {
  const dataRows = rows.map((cells, index) => ({ rowNumber: index + 2, cells }));
  const mapping = suggestMapping(HEADERS, dataRows);
  return validateRows(dataRows, mapping, { massUnit });
}

const GOOD: Cell[] = [
  '2027-01-12',
  '7208390000',
  '48000',
  '31800',
  'TR',
  'Meridian Alloy Works',
  'Verified',
  'GBP',
];
const with_ = (index: number, value: Cell): Cell[] =>
  GOOD.map((cell, i) => (i === index ? value : cell));
const withAll = (changes: Record<number, Cell>): Cell[] =>
  GOOD.map((cell, i) => (i in changes ? (changes[i] as Cell) : cell));

const codesFor = (result: ReturnType<typeof run>, rowNumber: number) =>
  result.issues.filter((issue) => issue.rowNumber === rowNumber).map((issue) => issue.code);

describe('validateRows', () => {
  it('accepts a clean row and builds a payload row', () => {
    const result = run([GOOD]);
    expect(result.counts).toMatchObject({ rowsFound: 1, included: 1, normalised: 0 });
    expect(result.rows[0]?.outcome).toBe('valid');
    expect(result.payloadRows[0]).toEqual({
      rowNumber: 2,
      importDate: '2027-01-12',
      commodityCode: '7208390000',
      description: null,
      originCountry: 'TR',
      supplier: 'Meridian Alloy Works',
      netMassKg: 48000,
      customsValueGbp: 31800,
      entryReference: null,
      supplierDeclaration: 'verified',
    });
  });

  it('rejects missing required fields and malformed dates, naming the cell', () => {
    const result = run([with_(1, ''), with_(0, '2027-13-02'), with_(2, ''), with_(3, null)]);
    expect(result.rows.map((row) => row.outcome)).toEqual([
      'rejected',
      'rejected',
      'rejected',
      'rejected',
    ]);
    expect(codesFor(result, 2)).toEqual(['missing_required']);
    expect(codesFor(result, 3)).toEqual(['malformed_date']);
    expect(result.issues[0]).toMatchObject({ field: 'commodityCode', severity: 'error' });
    expect(result.issues[1]).toMatchObject({ field: 'importDate', raw: '2027-13-02' });
    expect(result.counts.rejected).toBe(4);
    expect(result.payloadRows).toHaveLength(0);
  });

  it('rejects invalid commodity codes', () => {
    const result = run([with_(1, 'steel')]);
    expect(codesFor(result, 2)).toEqual(['invalid_commodity_code']);
  });

  it('normalises fixable cells and keeps the row', () => {
    const result = run([withAll({ 1: '7208.39.00.00', 2: '12,5 t', 4: 'Türkiye', 0: 46_388 })]);
    const row = result.rows[0]!;
    expect(row.outcome).toBe('normalised');
    expect(codesFor(result, 2).sort()).toEqual(
      [
        'commodity_code_normalised',
        'country_name_normalised',
        'excel_serial_date',
        'unit_in_numeric',
      ].sort(),
    );
    expect(result.payloadRows[0]).toMatchObject({
      importDate: '2027-01-01',
      commodityCode: '7208390000',
      netMassKg: 12500,
      originCountry: 'TR',
    });
    expect(result.counts).toMatchObject({ included: 1, normalised: 1 });
  });

  it('sends unsupported units, currencies and values to review', () => {
    const result = run([with_(2, '6 bags'), with_(7, 'EUR'), with_(3, 'n/a')]);
    expect(result.rows.map((row) => row.outcome)).toEqual([
      'needs_review',
      'needs_review',
      'needs_review',
    ]);
    expect(codesFor(result, 2)).toEqual(['unsupported_unit']);
    expect(codesFor(result, 3)).toEqual(['unsupported_currency']);
    expect(codesFor(result, 4)).toEqual(['unsupported_value']);
    expect(result.counts.needsReview).toBe(3);
    expect(result.payloadRows).toHaveLength(0);
  });

  it('keeps a row with an unknown country and notes it', () => {
    const result = run([with_(4, 'Narnia')]);
    expect(result.rows[0]?.outcome).toBe('valid');
    expect(codesFor(result, 2)).toEqual(['unknown_country']);
    expect(result.payloadRows[0]?.originCountry).toBeNull();
  });

  it('flags unverified declarations as a note, not a problem', () => {
    const result = run([with_(6, 'Unverified')]);
    expect(result.rows[0]?.outcome).toBe('valid');
    expect(codesFor(result, 2)).toEqual(['unverified_declaration']);
    expect(result.payloadRows[0]?.supplierDeclaration).toBe('unverified');
  });

  it('marks repeats as duplicates of the first row, but keeps the first', () => {
    const result = run([GOOD, with_(5, 'Atlas Metals'), GOOD]);
    expect(result.rows.map((row) => row.outcome)).toEqual(['valid', 'valid', 'duplicate']);
    expect(result.issues.find((issue) => issue.code === 'duplicate_row')).toMatchObject({
      rowNumber: 4,
      duplicateOf: 2,
    });
    expect(result.counts).toMatchObject({ rowsFound: 3, included: 2, duplicates: 1 });
  });

  it('excludes total rows and counts them', () => {
    const result = run([GOOD, ['Total', null, null, '31800', null, null, null, null]]);
    expect(result.rows[1]?.outcome).toBe('excluded_total');
    expect(result.counts).toMatchObject({ rowsFound: 2, included: 1, totalRowsExcluded: 1 });
  });

  it('reads decimal commas per column and adds a note', () => {
    const result = run([withAll({ 2: '12,5', 3: '1850,50' })]);
    expect(result.columnNotes.map((note) => note.code)).toContain('decimal_comma');
    expect(result.payloadRows[0]).toMatchObject({ netMassKg: 12.5, customsValueGbp: 1850.5 });
  });

  it('honours the default mass unit, but a unit in the cell wins', () => {
    expect(run([GOOD], 'tonnes').payloadRows[0]?.netMassKg).toBe(48_000_000);
    expect(run([with_(2, '900 kg')], 'tonnes').payloadRows[0]?.netMassKg).toBe(900);
  });

  it('adds a unit note unless the heading names one', () => {
    const dataRows = [{ rowNumber: 2, cells: GOOD }];
    const mapping = suggestMapping(HEADERS, dataRows);
    const assumed = validateRows(dataRows, mapping, { massUnit: 'kg' });
    expect(assumed.columnNotes.map((note) => note.code)).toContain('mass_unit_assumed');
    const named = validateRows(dataRows, mapping, { massUnit: 'kg', massUnitFromHeading: true });
    expect(named.columnNotes.map((note) => note.code)).not.toContain('mass_unit_assumed');
  });

  it('truncates long text with a note', () => {
    const result = run([with_(5, 'S'.repeat(130))]);
    expect(result.payloadRows[0]?.supplier).toHaveLength(120);
    expect(codesFor(result, 2)).toEqual(['text_truncated']);
  });
});

describe('validationHeading', () => {
  const base = {
    rowsFound: 0,
    included: 0,
    normalised: 0,
    needsReview: 0,
    duplicates: 0,
    rejected: 0,
    totalRowsExcluded: 0,
  };
  it('words the headline for every count', () => {
    expect(validationHeading({ ...base, included: 7 })).toBe('All 7 rows are ready.');
    expect(validationHeading({ ...base, included: 1 })).toBe('Your 1 row is ready.');
    expect(validationHeading({ ...base, needsReview: 1, duplicates: 1, rejected: 2 })).toBe(
      'We found 4 rows that need review.',
    );
    expect(validationHeading({ ...base, needsReview: 1 })).toBe(
      'We found 1 row that needs review.',
    );
  });
});
