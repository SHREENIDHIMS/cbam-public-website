import type { UploadFieldKey } from '@/lib/config/upload-fields';

/** A parsed spreadsheet or CSV cell. CSV cells are strings; XLSX cells keep their type. */
export type Cell = string | number | boolean | Date | null;

export interface ParsedSheet {
  name: string;
  rows: Cell[][];
}

export type IssueSeverity = 'error' | 'review' | 'fixed' | 'note';

export const ISSUE_CODES = [
  'missing_required',
  'malformed_date',
  'excel_serial_date',
  'invalid_commodity_code',
  'commodity_code_normalised',
  'country_name_normalised',
  'unknown_country',
  'unit_in_numeric',
  'unsupported_unit',
  'unsupported_currency',
  'unsupported_value',
  'ambiguous_number',
  'unverified_declaration',
  'unrecognised_declaration',
  'text_truncated',
  'duplicate_row',
] as const;
export type IssueCode = (typeof ISSUE_CODES)[number];

export type RowOutcome =
  'valid' | 'normalised' | 'needs_review' | 'rejected' | 'duplicate' | 'excluded_total';

/** Which column a field was read from: a column index, or `ignore` for columns not used. */
export type ColumnChoice = UploadFieldKey | 'ignore';

export type Confidence = 'high' | 'medium' | 'low' | 'none' | 'manual';

export type MassUnit = 'kg' | 'tonnes';
