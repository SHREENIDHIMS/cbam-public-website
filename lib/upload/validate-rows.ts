import type { ClientSummary, PreviewRow } from '@/lib/api/schemas';
import type { UploadFieldKey } from '@/lib/config/upload-fields';
import { toFieldColumns, type DataRowLike, type MappingSuggestion } from './column-matching';
import { columnNoteMessage, issueMessage, type ColumnNoteCode } from './issue-copy';
import {
  cellText,
  detectDecimalMode,
  isTotalCell,
  normaliseCommodityCode,
  normaliseCountry,
  normaliseCurrency,
  normaliseDeclaration,
  normaliseText,
  parseDateCell,
  parseNumberCell,
  type DecimalInfo,
  type Parsed,
  type ParsedIssue,
} from './normalise';
import type { Cell, IssueCode, IssueSeverity, MassUnit, RowOutcome } from './types';

const SUPPLIER_MAX = 120;
const DESCRIPTION_MAX = 200;
const REFERENCE_MAX = 40;

export interface RowIssue {
  rowNumber: number;
  field: UploadFieldKey | null;
  code: IssueCode;
  severity: IssueSeverity;
  /** The cell as it appears in the file. Shown on screen only; never sent or logged. */
  raw: string;
  normalised?: string;
  message: string;
  duplicateOf?: number;
}

export interface ColumnNote {
  field: UploadFieldKey;
  code: ColumnNoteCode;
  message: string;
}

export interface RowResult {
  rowNumber: number;
  outcome: RowOutcome;
  issues: RowIssue[];
}

export interface ValidationResult {
  rows: RowResult[];
  issues: RowIssue[];
  columnNotes: ColumnNote[];
  counts: ClientSummary;
  /** Rows that may be sent: outcome valid or normalised. */
  payloadRows: PreviewRow[];
  massUnit: MassUnit;
}

export interface ValidateOptions {
  massUnit: MassUnit;
  /** True when the Net mass heading itself names a unit, so no unit note is needed. */
  massUnitFromHeading?: boolean;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const OUTCOME_FOR: Record<IssueSeverity, RowOutcome | null> = {
  error: 'rejected',
  review: 'needs_review',
  fixed: 'normalised',
  note: null,
};

/**
 * Reads every row with the visitor's mapping. Each row ends as exactly one outcome and every
 * problem is recorded against its row and column. Values are never logged.
 */
export function validateRows(
  dataRows: readonly DataRowLike[],
  mapping: readonly MappingSuggestion[],
  options: ValidateOptions,
): ValidationResult {
  const columns = toFieldColumns(mapping);
  const cellOf = (row: DataRowLike, field: UploadFieldKey): Cell | undefined => {
    const index = columns[field];
    return index === undefined ? undefined : row.cells[index];
  };

  const isTotal = (row: DataRowLike) => row.cells.some((cell) => isTotalCell(cell));
  const dataOnly = dataRows.filter((row) => !isTotal(row));

  const columnNotes: ColumnNote[] = [];
  const decimals: Partial<Record<'netMass' | 'customsValue', DecimalInfo>> = {};
  for (const field of ['netMass', 'customsValue'] as const) {
    if (columns[field] === undefined) continue;
    const info = detectDecimalMode(dataOnly.map((row) => cellOf(row, field) ?? null));
    decimals[field] = info;
    if (info.mode === 'comma') {
      columnNotes.push({
        field,
        code: 'decimal_comma',
        message: columnNoteMessage('decimal_comma', field),
      });
    } else if (info.mode === 'mixed') {
      columnNotes.push({
        field,
        code: 'mixed_decimals',
        message: columnNoteMessage('mixed_decimals', field),
      });
    }
  }
  if (columns.netMass !== undefined && !options.massUnitFromHeading) {
    columnNotes.push({
      field: 'netMass',
      code: 'mass_unit_assumed',
      message: columnNoteMessage('mass_unit_assumed', 'netMass', {
        unit: options.massUnit === 'tonnes' ? 'tonnes' : 'kilograms',
      }),
    });
  }

  const rows: RowResult[] = [];
  const allIssues: RowIssue[] = [];
  const payloadRows: PreviewRow[] = [];
  const seen = new Map<string, number>();
  const counts: ClientSummary = {
    rowsFound: dataRows.length,
    included: 0,
    normalised: 0,
    needsReview: 0,
    duplicates: 0,
    rejected: 0,
    totalRowsExcluded: 0,
  };

  for (const row of dataRows) {
    if (isTotal(row)) {
      counts.totalRowsExcluded += 1;
      rows.push({ rowNumber: row.rowNumber, outcome: 'excluded_total', issues: [] });
      continue;
    }

    const issues: RowIssue[] = [];
    const record = <T>(field: UploadFieldKey, parsed: Parsed<T>, normalisedText?: string) => {
      const issue: ParsedIssue | undefined = parsed.issue;
      if (!issue) return;
      const raw = cellText(cellOf(row, field));
      const entry: RowIssue = {
        rowNumber: row.rowNumber,
        field,
        code: issue.code,
        severity: issue.severity,
        raw,
        message: issueMessage(issue.code, { field, raw, normalised: normalisedText }),
      };
      if (normalisedText !== undefined) entry.normalised = normalisedText;
      issues.push(entry);
    };
    const requireValue = (field: UploadFieldKey, parsed: Parsed<unknown>) => {
      if (!parsed.empty) return;
      issues.push({
        rowNumber: row.rowNumber,
        field,
        code: 'missing_required',
        severity: 'error',
        raw: '',
        message: issueMessage('missing_required', { field, raw: '' }),
      });
    };

    const code = normaliseCommodityCode(cellOf(row, 'commodityCode'));
    requireValue('commodityCode', code);
    record('commodityCode', code, code.value ?? undefined);

    const date = parseDateCell(cellOf(row, 'importDate'));
    requireValue('importDate', date);
    record('importDate', date, date.value ?? undefined);

    const mass = parseNumberCell(
      cellOf(row, 'netMass'),
      decimals.netMass ?? { mode: 'dot', majority: 'dot' },
      'mass',
    );
    requireValue('netMass', mass);
    let netMassKg: number | null = null;
    if (mass.value !== null) {
      const unit = mass.unit ?? (options.massUnit === 'tonnes' ? 't' : 'kg');
      netMassKg = round3(unit === 't' ? mass.value * 1000 : mass.value);
    }
    record('netMass', mass, netMassKg === null ? undefined : `${netMassKg} kg`);

    const value = parseNumberCell(
      cellOf(row, 'customsValue'),
      decimals.customsValue ?? { mode: 'dot', majority: 'dot' },
      'money',
    );
    requireValue('customsValue', value);
    record('customsValue', value, value.value === null ? undefined : `£${value.value}`);

    const country = normaliseCountry(cellOf(row, 'originCountry'));
    record('originCountry', country, country.value ?? undefined);

    const supplier = normaliseText(cellOf(row, 'supplier'), SUPPLIER_MAX);
    record('supplier', supplier);
    const description = normaliseText(cellOf(row, 'description'), DESCRIPTION_MAX);
    record('description', description);
    const reference = normaliseText(cellOf(row, 'entryReference'), REFERENCE_MAX);
    record('entryReference', reference);

    if (columns.currency !== undefined) {
      record('currency', normaliseCurrency(cellOf(row, 'currency')));
    }

    const declaration =
      columns.supplierDeclaration === undefined
        ? null
        : normaliseDeclaration(cellOf(row, 'supplierDeclaration'));
    if (declaration) record('supplierDeclaration', declaration);

    let outcome: RowOutcome = 'valid';
    for (const issue of issues) {
      const next = OUTCOME_FOR[issue.severity];
      if (next === 'rejected') outcome = 'rejected';
      else if (next === 'needs_review' && outcome !== 'rejected') outcome = 'needs_review';
      else if (next === 'normalised' && outcome === 'valid') outcome = 'normalised';
    }

    const candidate = {
      importDate: date.value,
      commodityCode: code.value,
      description: description.value,
      originCountry: country.value,
      supplier: supplier.value,
      netMassKg,
      customsValueGbp: value.value,
      entryReference: reference.value,
      supplierDeclaration: declaration ? declaration.value : null,
    };

    if (outcome === 'valid' || outcome === 'normalised' || outcome === 'needs_review') {
      const key = JSON.stringify(candidate);
      const first = seen.get(key);
      if (first !== undefined) {
        outcome = 'duplicate';
        issues.push({
          rowNumber: row.rowNumber,
          field: null,
          code: 'duplicate_row',
          severity: 'review',
          raw: '',
          message: issueMessage('duplicate_row', { field: null, raw: '', duplicateOf: first }),
          duplicateOf: first,
        });
      } else {
        seen.set(key, row.rowNumber);
      }
    }

    if (outcome === 'valid' || outcome === 'normalised') {
      counts.included += 1;
      if (outcome === 'normalised') counts.normalised += 1;
      payloadRows.push({
        rowNumber: row.rowNumber,
        importDate: candidate.importDate!,
        commodityCode: candidate.commodityCode!,
        description: candidate.description,
        originCountry: candidate.originCountry,
        supplier: candidate.supplier,
        netMassKg: candidate.netMassKg!,
        customsValueGbp: candidate.customsValueGbp!,
        entryReference: candidate.entryReference,
        supplierDeclaration: candidate.supplierDeclaration,
      });
    } else if (outcome === 'needs_review') counts.needsReview += 1;
    else if (outcome === 'duplicate') counts.duplicates += 1;
    else if (outcome === 'rejected') counts.rejected += 1;

    rows.push({ rowNumber: row.rowNumber, outcome, issues });
    allIssues.push(...issues);
  }

  return { rows, issues: allIssues, columnNotes, counts, payloadRows, massUnit: options.massUnit };
}
