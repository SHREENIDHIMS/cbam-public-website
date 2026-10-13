/**
 * Generates the XLSX sample files in tests/fixtures. The CSV fixtures are written by hand.
 * Run with `npm run fixtures:generate`, then `npm run fixtures:hash` and update the manifest.
 * All companies and figures are fictional.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import writeXlsxFile from 'write-excel-file/node';

const ROOT = join(process.cwd(), 'tests', 'fixtures');

type Value = string | number | Date | null;
type Row = Value[];

function toSheetData(rows: Row[]) {
  return rows.map((row) =>
    row.map((value) => {
      if (value === null) return null;
      if (value instanceof Date) return { value, type: Date, format: 'yyyy-mm-dd' };
      return { value };
    }),
  );
}

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

async function meridian() {
  const imports: Row[] = [
    [
      'Date of import',
      'Declaration no.',
      'CN code',
      'Description',
      'Origin',
      'Supplier name',
      'Net weight (kg)',
      'Value £',
    ],
    [
      utc('2027-01-20'),
      'MA-1001',
      7601100000,
      'Unwrought aluminium ingot, non-alloyed',
      'IN',
      'Meridian Alloy Works',
      3000,
      7200,
    ],
    [
      utc('2027-02-14'),
      'MA-1002',
      7602000000,
      'Aluminium scrap (used beverage cans)',
      'NL',
      'North Channel Materials',
      5000,
      4900,
    ],
    [
      utc('2027-03-08'),
      'MA-1003',
      7604210000,
      'Aluminium hollow profiles',
      'CN',
      'Meridian Alloy Works',
      1500,
      5850,
    ],
    [
      utc('2027-03-30'),
      'MA-1004',
      7606125000,
      'Aluminium alloy plate',
      'TR',
      'Atlas Metals',
      1200,
      4560,
    ],
  ];
  const notes: Row[] = [
    ['Notes'],
    ['Values are customs values in GBP.'],
    ['Prepared for Meridian Aluminium Trading Ltd (fictional).'],
  ];
  await writeXlsxFile([
    { data: toSheetData(imports), sheet: 'Imports' },
    { data: toSheetData(notes), sheet: 'Notes' },
  ]).toFile(join(ROOT, 'meridian-aluminium.xlsx'));
}

async function supplierB() {
  const cover: Row[] = [
    ['Supplier B shipment file'],
    ['Prepared for Greenfield Building Materials Ltd (fictional)'],
    ['Line data is on sheet "Lines"'],
  ];
  const lines: Row[] = [
    ['Supplier B shipments – Greenfield Building Materials Ltd (fictional)'],
    [],
    [
      'Supplier',
      'Comodity code',
      'Origin',
      'Net mass',
      'Customs value',
      'Import date',
      'Description',
      'Declaration status',
    ],
    [
      'North Channel Materials',
      '2523290000',
      'Türkiye',
      '12,5 t',
      '1850,50',
      '03/02/2027',
      'Grey cement, bulk',
      'Unverified',
    ],
    [
      'North Channel Materials',
      '2523.29.00.00',
      'TR',
      '18000',
      '2664',
      '17/02/2027',
      'Grey cement, bulk',
      'Unverified',
    ],
    [
      'Atlas Metals',
      '7214200000',
      'IN',
      '28,5 t',
      '26650',
      '01/03/2027',
      'Steel reinforcing bar',
      'Verified',
    ],
    [
      'Atlas Metals',
      '7214200000',
      'IN',
      '6 bags',
      '900',
      '09/03/2027',
      'Steel bar offcuts',
      'Verified',
    ],
    [
      'Meridian Alloy Works',
      '7604299000',
      'CN',
      '2,4 t',
      '9450',
      '21/03/2027',
      'Aluminium extruded profiles',
      null,
    ],
    ['Total', null, null, null, '41514,50', null, null, null],
  ];
  await writeXlsxFile([
    { data: toSheetData(cover), sheet: 'Cover' },
    { data: toSheetData(lines), sheet: 'Lines' },
  ]).toFile(join(ROOT, 'supplier-b-messy.xlsx'));
}

async function macroFile() {
  const rows: Row[] = [
    ['Entry date', 'Commodity code', 'Net mass', 'Customs value'],
    ['2027-01-12', '7208390000', 48000, 31800],
  ];
  await writeXlsxFile(toSheetData(rows)).toFile(join(ROOT, 'invalid', 'report.xlsm'));
}

async function main() {
  mkdirSync(join(ROOT, 'invalid'), { recursive: true });
  await meridian();
  await supplierB();
  await macroFile();
  console.log('Fixtures written to tests/fixtures');
}

void main();
