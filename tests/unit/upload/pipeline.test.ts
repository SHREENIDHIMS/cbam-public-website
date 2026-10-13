// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { FIXTURE_LINES } from '@/lib/api/fixtures/liability-lines';
import { FILE_CHECK_MESSAGES, checkFile } from '@/lib/upload/file-checks';
import { parseWorkbook, ParseError } from '@/lib/upload/parse-file';
import { readFixture, runPipeline } from '@/tests/utils/pipeline';

describe('upload pipeline on the committed fixtures', () => {
  it('Northstar: 7 rows, all ready', async () => {
    const run = await runPipeline('northstar-steel-imports.csv');
    expect(run.validation.counts).toEqual({
      rowsFound: 7,
      included: 7,
      normalised: 0,
      needsReview: 0,
      duplicates: 0,
      rejected: 0,
      totalRowsExcluded: 0,
    });
    expect(run.validation.issues).toEqual([]);
    expect(run.request?.sheetName).toBeNull();
    expect(run.request?.fileType).toBe('csv');
  });

  it('Meridian: reads real date and number cells from the first sheet', async () => {
    const run = await runPipeline('meridian-aluminium.xlsx');
    expect(run.sheets.map((sheet) => sheet.name)).toEqual(['Imports', 'Notes']);
    expect(run.switchedFrom).toBeNull();
    expect(run.validation.counts).toMatchObject({ rowsFound: 4, included: 4, normalised: 0 });
    expect(run.request?.sheetName).toBe('Imports');
  });

  it('Supplier B: switches sheet and reports the messy cells', async () => {
    const run = await runPipeline('supplier-b-messy.xlsx');
    expect(run.switchedFrom).toEqual({ from: 'Cover', to: 'Lines' });
    expect(run.headings.skippedAbove).toBe(2);
    expect(run.validation.counts).toEqual({
      rowsFound: 6,
      included: 4,
      normalised: 4,
      needsReview: 1,
      duplicates: 0,
      rejected: 0,
      totalRowsExcluded: 1,
    });
    const byRow = (row: number) =>
      run.validation.issues.filter((issue) => issue.rowNumber === row).map((issue) => issue.code);
    expect(byRow(4)).toEqual([
      'unit_in_numeric',
      'country_name_normalised',
      'unverified_declaration',
    ]);
    expect(byRow(5)).toEqual(['commodity_code_normalised', 'unverified_declaration']);
    expect(byRow(7)).toEqual(['unsupported_unit']);
    expect(run.validation.columnNotes.map((note) => `${note.field}:${note.code}`)).toEqual([
      'netMass:decimal_comma',
      'customsValue:decimal_comma',
      'netMass:mass_unit_assumed',
    ]);
  });

  it('Broker export: finds the exact row issues', async () => {
    const run = await runPipeline('broker-export-messy.csv');
    expect(run.validation.counts).toEqual({
      rowsFound: 8,
      included: 4,
      normalised: 0,
      needsReview: 1,
      duplicates: 1,
      rejected: 2,
      totalRowsExcluded: 0,
    });
    const issues = run.validation.issues.map((issue) => `${issue.rowNumber}:${issue.code}`);
    expect(issues).toEqual([
      '3:malformed_date',
      '5:duplicate_row',
      '6:missing_required',
      '8:unsupported_currency',
    ]);
    expect(run.validation.issues.find((issue) => issue.code === 'duplicate_row')?.duplicateOf).toBe(
      4,
    );
    expect(run.validation.issues[0]?.raw).toBe('2027-13-02');
    expect(run.validation.columnNotes.some((note) => note.code === 'decimal_comma')).toBe(true);
  });

  it.each([
    ['northstar-steel-imports.csv', 'northstar'],
    ['meridian-aluminium.xlsx', 'meridian'],
    ['supplier-b-messy.xlsx', 'supplier_b'],
    ['broker-export-messy.csv', 'broker_export'],
  ] as const)('%s sends exactly the rows the fixture lines describe', async (file, key) => {
    const run = await runPipeline(file);
    const sent = run.request!.rows.map((row) => ({
      rowNumber: row.rowNumber,
      importDate: row.importDate,
      commodityCode: row.commodityCode,
      description: row.description,
      originCountry: row.originCountry,
      supplier: row.supplier,
      netMassKg: row.netMassKg,
      customsValueGbp: row.customsValueGbp,
      entryReference: row.entryReference,
      supplierDeclaration: row.supplierDeclaration,
    }));
    const expected = FIXTURE_LINES[key].map((line) => ({
      rowNumber: line.rowNumber,
      importDate: line.importDate,
      commodityCode: line.commodityCode,
      description: line.description,
      originCountry: line.originCountry,
      supplier: line.supplier,
      netMassKg: line.netMassKg,
      customsValueGbp: line.customsValueGbp,
      entryReference: line.entryReference,
      supplierDeclaration: line.supplierDeclaration,
    }));
    expect(sent).toEqual(expected);
  });

  it('the request carries no header, file name or raw cell text beyond the mapped fields', async () => {
    const run = await runPipeline('supplier-b-messy.xlsx');
    const text = JSON.stringify(run.request);
    expect(text).not.toMatch(/Comodity|Declaration status|supplier-b|12,5 t|bags/);
    expect(Object.keys(run.request!).sort()).toEqual(
      ['clientSummary', 'fileSha256', 'fileType', 'rows', 'sheetName'].sort(),
    );
  });
});

describe('edge and invalid files', () => {
  it('a headers-only CSV reports no data rows', async () => {
    const run = await runPipeline('edge/headers-only.csv');
    expect(run.dataCheck).toEqual({ ok: false, error: 'no_data_rows' });
  });

  it('the macro-enabled workbook is rejected before parsing', () => {
    const result = checkFile({ name: 'report.xlsm', type: '', size: 2887 });
    expect(result).toMatchObject({ ok: false, reason: 'macro_file' });
    expect(FILE_CHECK_MESSAGES.macro_file).toMatch(/\.xlsx or \.csv/);
  });

  it('a corrupt workbook becomes a parse error', async () => {
    const bytes = new TextEncoder().encode('not a zip file').buffer as ArrayBuffer;
    await expect(parseWorkbook(bytes, 'xlsx')).rejects.toBeInstanceOf(ParseError);
  });

  it('decodes windows-1252 and strips a byte order mark', async () => {
    const header = 'Entry date,Commodity code,Net mass,Customs value,Supplier\n';
    const line = '2027-01-12,7208390000,48000,31800,Café Metals\n';
    const latin1 = new Uint8Array([...header, ...line].map((char) => char.charCodeAt(0)));
    const sheets = await parseWorkbook(latin1.buffer as ArrayBuffer, 'csv');
    expect(sheets[0]?.rows[1]?.[4]).toBe('Café Metals');

    const bom = new TextEncoder().encode(`﻿${header}${line}`);
    const withBom = await parseWorkbook(bom.buffer as ArrayBuffer, 'csv');
    expect(withBom[0]?.rows[0]?.[0]).toBe('Entry date');
  });

  it('keeps fixtures readable from disk', () => {
    expect(readFixture('northstar-steel-imports.csv').byteLength).toBeGreaterThan(100);
  });
});
