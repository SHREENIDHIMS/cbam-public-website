import { toolsConfig } from '@/lib/config/tools';
import { getUploadField, type UploadFieldKey } from '@/lib/config/upload-fields';
import type { ClientSummary } from '@/lib/api/schemas';
import { formatInteger } from '@/lib/utils/format';
import type { IssueCode, RowOutcome } from './types';

/** Plain-English messages for every issue, column note and file-level error. */

const MEGABYTE = 1024 * 1024;

export interface IssueContext {
  field: UploadFieldKey | null;
  raw: string;
  normalised?: string | undefined;
  duplicateOf?: number | undefined;
}

function label(field: UploadFieldKey | null): string {
  return field ? getUploadField(field).label : 'This cell';
}

function quoted(raw: string): string {
  return raw === '' ? 'an empty cell' : `"${raw}"`;
}

export function issueMessage(code: IssueCode, context: IssueContext): string {
  const { field, raw, normalised, duplicateOf } = context;
  switch (code) {
    case 'missing_required':
      return `${label(field)} is missing. This column is needed for every line.`;
    case 'malformed_date':
      return `${quoted(raw)} is not a date we can read. Use a day-month-year date such as 14/01/2027 or 2027-01-14.`;
    case 'excel_serial_date':
      return `${quoted(raw)} is a spreadsheet date number. Read as ${normalised ?? 'a date'}.`;
    case 'invalid_commodity_code':
      return `${quoted(raw)} is not a commodity code. Codes have 6 to 10 digits.`;
    case 'commodity_code_normalised':
      return `Spaces, dots or dashes removed: ${quoted(raw)} read as ${normalised ?? ''}.`;
    case 'country_name_normalised':
      return `Country name ${quoted(raw)} read as the code ${normalised ?? ''}.`;
    case 'unknown_country':
      return `We do not recognise the country ${quoted(raw)}. The line is kept without an origin.`;
    case 'unit_in_numeric':
      return `A unit was typed in the cell: ${quoted(raw)} read as ${normalised ?? ''}.`;
    case 'unsupported_unit':
      return `${quoted(raw)} has a unit we cannot convert. Use kilograms or tonnes.`;
    case 'unsupported_currency':
      return `The public preview only supports values in GBP. ${quoted(raw)} was not used.`;
    case 'unsupported_value':
      return `${quoted(raw)} is not a number we can read.`;
    case 'ambiguous_number':
      return `${quoted(raw)} uses a different decimal style from the rest of its column. Check it.`;
    case 'unverified_declaration':
      return 'Supplier declaration marked unverified. Default values will be used for this line.';
    case 'unrecognised_declaration':
      return `${quoted(raw)} is not a status we recognise. Treated as no supplier emissions data.`;
    case 'text_truncated':
      return `${label(field)} was longer than the preview allows and was shortened.`;
    case 'duplicate_row':
      return `Repeat of row ${duplicateOf ?? ''}. Left out so it is not counted twice.`;
  }
}

export const OUTCOME_LABELS: Record<RowOutcome, string> = {
  valid: 'Ready',
  normalised: 'Normalised',
  needs_review: 'Needs review',
  rejected: 'Rejected',
  duplicate: 'Duplicate',
  excluded_total: 'Total row',
};

export type ColumnNoteCode = 'decimal_comma' | 'mixed_decimals' | 'mass_unit_assumed';

export function columnNoteMessage(
  code: ColumnNoteCode,
  field: UploadFieldKey,
  extra?: { unit?: 'kilograms' | 'tonnes' },
): string {
  const name = getUploadField(field).label;
  switch (code) {
    case 'decimal_comma':
      return `Decimal commas found in ${name}; read as decimal points.`;
    case 'mixed_decimals':
      return `${name} mixes decimal commas and decimal points. Cells that differ from most of the column need review.`;
    case 'mass_unit_assumed':
      return `We will read ${name} as ${extra?.unit ?? 'kilograms'} unless a cell gives a unit.`;
  }
}

/** "We found 4 rows that need review." or "All 7 rows are ready." with the singular handled. */
export function validationHeading(counts: ClientSummary): string {
  const review = counts.needsReview + counts.duplicates + counts.rejected;
  if (review === 0) {
    return counts.included === 1
      ? 'Your 1 row is ready.'
      : `All ${counts.included} rows are ready.`;
  }
  return review === 1
    ? 'We found 1 row that needs review.'
    : `We found ${review} rows that need review.`;
}

export type FileLevelError =
  'parse_error' | 'no_headings' | 'no_data_rows' | 'row_limit' | 'no_valid_rows';

export function fileErrorMessage(error: FileLevelError, count?: number): string {
  const { maxDataRows } = toolsConfig.upload;
  switch (error) {
    case 'parse_error':
      return 'We could not read this file. It may be password-protected or damaged. Your file has not been changed.';
    case 'no_headings':
      return 'We could not find column headings in this file. Check that a row names columns such as commodity code, import date, net mass and customs value.';
    case 'no_data_rows':
      return 'This file has column headings but no data rows below them. Add your lines and try again.';
    case 'row_limit':
      return `This file has ${formatInteger(count ?? 0)} data rows. The public preview accepts up to ${formatInteger(maxDataRows)}.`;
    case 'no_valid_rows':
      return 'No rows in this file can be used yet. Fix the issues listed, then upload the file again.';
  }
}

export const FILE_SIZE_LIMIT_MB = toolsConfig.upload.maxFileBytes / MEGABYTE;
