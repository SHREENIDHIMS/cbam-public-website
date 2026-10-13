import { UPLOAD_FIELDS } from '@/lib/config/upload-fields';
import type { Tone } from '@/lib/config/status';
import {
  CONFIDENCE_LABELS,
  fieldLabel,
  massUnitHint,
  suggestMapping,
  type MappingSuggestion,
} from '@/lib/upload/column-matching';
import { pickSheet } from '@/lib/upload/headings';
import { OUTCOME_LABELS } from '@/lib/upload/issue-copy';
import { cellText } from '@/lib/upload/normalise';
import type { Cell, Confidence, MassUnit, ParsedSheet, RowOutcome } from '@/lib/upload/types';
import { validateRows, type RowIssue, type ValidationResult } from '@/lib/upload/validate-rows';

/**
 * The worked example (MASTER_PROMPT 17). Two fictional supplier files are run through the same
 * heading discovery, column matching and row validation the liability preview uses in the browser,
 * so what the page shows is what the engine actually does. Nothing is typed by hand about the
 * outcome: every decision below is derived from the engine's own result.
 *
 * Supplier A is the Northstar sample file plus one row with no commodity code (row 9), added so a
 * rejection can be shown. Supplier B is the messy sample file (tests/fixtures/supplier-b-messy.xlsx).
 */

export const DECISION_KINDS = ['detected', 'normalised', 'needs_review', 'rejected'] as const;
export type DecisionKind = (typeof DECISION_KINDS)[number];

export const DECISION_COPY: Readonly<
  Record<DecisionKind, { label: string; meaning: string; tone: Tone }>
> = {
  detected: {
    label: 'Detected',
    meaning: 'Something the engine found or read as it was. No change was made to your data.',
    tone: 'info',
  },
  normalised: {
    label: 'Normalised',
    meaning:
      'A value was changed into a standard form. The original and the result are both shown.',
    tone: 'positive',
  },
  needs_review: {
    label: 'Needs review',
    meaning: 'The engine could not be sure. The line or the match is held until a person decides.',
    tone: 'watch',
  },
  rejected: {
    label: 'Rejected',
    meaning: 'The row cannot be used, for example because a required value is missing.',
    tone: 'critical',
  },
};

type Row = Cell[];

const SUPPLIER_A_ROWS: Row[] = [
  [
    'Entry date',
    'Entry reference',
    'Commodity code',
    'Goods description',
    'Country of origin',
    'Supplier',
    'Net mass (kg)',
    'Customs value (GBP)',
    'Supplier emissions data',
  ],
  [
    '2026-12-15',
    'NS-26-0099',
    '7208390000',
    'Hot-rolled steel coil (December shipment)',
    'TR',
    'Meridian Alloy Works',
    '25000',
    '16500',
    'Verified',
  ],
  [
    '2027-01-12',
    'NS-27-0001',
    '7208390000',
    'Hot-rolled steel coil',
    'TR',
    'Meridian Alloy Works',
    '48000',
    '31800',
    'Verified',
  ],
  [
    '2027-02-03',
    'NS-27-0002',
    '7318158100',
    'Steel hex bolts (fasteners)',
    'IN',
    'Atlas Metals',
    '6000',
    '9150',
    'None',
  ],
  [
    '2027-02-17',
    'NS-27-0003',
    '7210490000',
    'Galvanised steel sheet',
    'CN',
    'Atlas Metals',
    '22000',
    '18700',
    'None',
  ],
  [
    '2027-03-05',
    'NS-27-0004',
    '7204410000',
    'Ferrous scrap (turnings)',
    'NL',
    'North Channel Materials',
    '30000',
    '4900',
    'None',
  ],
  [
    '2027-03-19',
    'NS-27-0005',
    '2523290000',
    'Portland cement (bagged)',
    'TR',
    'North Channel Materials',
    '40000',
    '3700',
    'None',
  ],
  [
    '2027-04-02',
    'NS-27-0006',
    '7306309000',
    'Welded steel tube',
    'VN',
    'Atlas Metals',
    '9000',
    '8400',
    'None',
  ],
  [
    '2027-04-20',
    'NS-27-0007',
    null,
    'Galvanised steel wire',
    'CN',
    'Atlas Metals',
    '4000',
    '5200',
    'None',
  ],
];

const SUPPLIER_B_COVER: Row[] = [
  ['Supplier B shipment file'],
  ['Prepared for Greenfield Building Materials Ltd (fictional)'],
  ['Line data is on sheet "Lines"'],
];

const SUPPLIER_B_ROWS: Row[] = [
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

export interface WorkedMapping {
  header: string;
  fieldLabel: string | null;
  confidence: Confidence;
  confidenceLabel: string;
  reason: string;
}

export interface WorkedIssue {
  field: string;
  kind: DecisionKind;
  raw: string;
  normalised: string | null;
  message: string;
}

export interface WorkedRow {
  rowNumber: number;
  cells: string[];
  outcome: RowOutcome;
  outcomeLabel: string;
  kind: DecisionKind;
  issues: WorkedIssue[];
}

export interface WorkedDecision {
  id: string;
  kind: DecisionKind;
  file: 'A' | 'B';
  where: string;
  saw: string;
  did: string;
}

export interface WorkedFile {
  id: 'a' | 'b';
  letter: 'A' | 'B';
  title: string;
  blurb: string;
  format: string;
  sheetNote: string | null;
  headerRowNumber: number;
  skippedAbove: number;
  headers: string[];
  mapping: WorkedMapping[];
  rows: WorkedRow[];
  counts: ValidationResult['counts'];
  columnNotes: string[];
  decisions: WorkedDecision[];
}

const SEVERITY_KIND: Record<RowIssue['severity'], DecisionKind> = {
  error: 'rejected',
  review: 'needs_review',
  fixed: 'normalised',
  note: 'detected',
};

const OUTCOME_KIND: Record<RowOutcome, DecisionKind> = {
  valid: 'detected',
  normalised: 'normalised',
  needs_review: 'needs_review',
  rejected: 'rejected',
  duplicate: 'needs_review',
  excluded_total: 'detected',
};

function mappingFor(entry: MappingSuggestion): WorkedMapping {
  return {
    header: entry.header,
    fieldLabel: entry.field === 'ignore' ? null : fieldLabel(entry.field),
    confidence: entry.confidence,
    confidenceLabel: CONFIDENCE_LABELS[entry.confidence],
    reason: entry.reason,
  };
}

function run(input: {
  id: 'a' | 'b';
  title: string;
  blurb: string;
  format: string;
  sheets: ParsedSheet[];
}): WorkedFile {
  const letter = input.id === 'a' ? 'A' : 'B';
  const pick = pickSheet(input.sheets);
  if (!pick.ok) throw new Error(`Worked example ${letter}: headings not found.`);
  const { headings, switchedFrom } = pick.value;
  const sheetNote = switchedFrom
    ? `The first sheet, "${switchedFrom.from}", has no import lines. The lines are on the sheet "${switchedFrom.to}".`
    : null;
  const mapping = suggestMapping(headings.headers, headings.dataRows);
  const hint = massUnitHint(mapping);
  const massUnit: MassUnit = hint === 't' ? 'tonnes' : 'kg';
  const validation = validateRows(headings.dataRows, mapping, {
    massUnit,
    massUnitFromHeading: hint !== null,
  });

  const rows: WorkedRow[] = headings.dataRows.map((dataRow) => {
    const result = validation.rows.find((candidate) => candidate.rowNumber === dataRow.rowNumber);
    if (!result) throw new Error(`Worked example ${letter}: row ${dataRow.rowNumber} missing.`);
    return {
      rowNumber: dataRow.rowNumber,
      cells: headings.headers.map((_, index) => cellText(dataRow.cells[index])),
      outcome: result.outcome,
      outcomeLabel: OUTCOME_LABELS[result.outcome],
      kind: OUTCOME_KIND[result.outcome],
      issues: result.issues.map((issue) => ({
        field: issue.field ? fieldLabel(issue.field) : 'Row',
        kind: SEVERITY_KIND[issue.severity],
        raw: issue.raw,
        normalised: issue.normalised ?? null,
        message: issue.message,
      })),
    };
  });

  const decisions: WorkedDecision[] = [];
  const add = (decision: Omit<WorkedDecision, 'id' | 'file'>) =>
    decisions.push({ ...decision, id: `${input.id}-${decisions.length}`, file: letter });

  add({
    kind: 'detected',
    where: 'Whole file',
    saw:
      headings.skippedAbove > 0
        ? `${headings.skippedAbove} rows above the column headings`
        : 'Column headings in the first row',
    did: `Found the heading row at row ${headings.headerRowIndex + 1} and read the rows below it as data.`,
  });
  if (sheetNote) {
    add({
      kind: 'detected',
      where: 'Whole file',
      saw: sheetNote,
      did: 'Chose the sheet that looks like import lines. You can pick another sheet.',
    });
  }
  for (const entry of mapping) {
    if (entry.field === 'ignore') continue;
    const needsCheck = entry.confidence === 'medium' || entry.confidence === 'low';
    if (needsCheck) {
      add({
        kind: 'needs_review',
        where: `Column "${entry.header}"`,
        saw: entry.header,
        did: `Suggested ${fieldLabel(entry.field)}. ${entry.reason}. Check this match before continuing.`,
      });
    }
  }
  const matched = mapping.filter((entry) => entry.field !== 'ignore').length;
  add({
    kind: 'detected',
    where: 'Column headings',
    saw: `${headings.headers.length} columns`,
    did: `Matched ${matched} columns to fields the preview reads. Each match shows how sure the engine is.`,
  });
  for (const note of validation.columnNotes) {
    add({
      kind: 'detected',
      where: `Column ${fieldLabel(note.field)}`,
      saw: note.code.replace(/_/g, ' '),
      did: note.message,
    });
  }
  for (const row of rows) {
    if (row.outcome === 'excluded_total') {
      add({
        kind: 'detected',
        where: `Row ${row.rowNumber}`,
        saw: row.cells.filter(Boolean).join(', '),
        did: 'Looks like a total row, not an import line. Left out so it is not counted twice.',
      });
    }
    for (const issue of row.issues) {
      add({
        kind: issue.kind,
        where: `Row ${row.rowNumber}, ${issue.field}`,
        saw: issue.raw === '' ? 'Empty' : issue.raw,
        did: issue.message,
      });
    }
  }

  return {
    id: input.id,
    letter,
    title: input.title,
    blurb: input.blurb,
    format: input.format,
    sheetNote,
    headerRowNumber: headings.headerRowIndex + 1,
    skippedAbove: headings.skippedAbove,
    headers: headings.headers,
    mapping: mapping.map(mappingFor),
    rows,
    counts: validation.counts,
    columnNotes: validation.columnNotes.map((note) => note.message),
    decisions,
  };
}

export function buildWorkedExample(): { files: [WorkedFile, WorkedFile] } {
  return {
    files: [
      run({
        id: 'a',
        title: 'Supplier A',
        blurb: 'A clean export: headings in the first row, one value per cell, mostly valid.',
        format: 'CSV, one sheet',
        sheets: [{ name: 'CSV', rows: SUPPLIER_A_ROWS }],
      }),
      run({
        id: 'b',
        title: 'Supplier B',
        blurb:
          'A messy workbook: a title above the headings, a typo in a heading, decimal commas, units typed into cells, a total row and an unverified declaration.',
        format: 'XLSX, two sheets',
        sheets: [
          { name: 'Cover', rows: SUPPLIER_B_COVER },
          { name: 'Lines', rows: SUPPLIER_B_ROWS },
        ],
      }),
    ],
  };
}

export function countDecisions(files: readonly WorkedFile[]): Record<DecisionKind, number> {
  const counts: Record<DecisionKind, number> = {
    detected: 0,
    normalised: 0,
    needs_review: 0,
    rejected: 0,
  };
  for (const file of files) for (const decision of file.decisions) counts[decision.kind] += 1;
  return counts;
}

/** Field labels the preview reads, for the "what the engine looks for" list. */
export const WORKED_FIELD_LABELS: readonly string[] = UPLOAD_FIELDS.map((field) => field.label);
