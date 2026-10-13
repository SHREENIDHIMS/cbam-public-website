import { matchCountry } from './countries';
import type { Cell, IssueCode, IssueSeverity } from './types';

/** Cell and heading normalisers. Pure functions; they never log or store a value. */

export interface ParsedIssue {
  code: IssueCode;
  severity: IssueSeverity;
}

export interface Parsed<T> {
  value: T | null;
  /** True when the cell was blank. */
  empty?: boolean;
  issue?: ParsedIssue;
}

export function isEmptyCell(cell: Cell | undefined): boolean {
  if (cell === null || cell === undefined) return true;
  return typeof cell === 'string' && cell.trim() === '';
}

/** The text of a cell as the visitor would see it. Used for display and header matching. */
export function cellText(cell: Cell | undefined): string {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date)
    return Number.isNaN(cell.getTime()) ? '' : cell.toISOString().slice(0, 10);
  return String(cell).trim();
}

/* ------------------------------------------------------------------ headings */

export interface NormalisedHeader {
  text: string;
  tokens: string[];
  unitHint: 'kg' | 't' | 'gbp' | null;
}

/** Folds case and diacritics, pulls out a unit hint such as "(kg)" or "£", and tokenises. */
export function normaliseHeader(raw: Cell | undefined): NormalisedHeader {
  let text = cellText(raw).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();

  let unitHint: NormalisedHeader['unitHint'] = null;
  const bracket = text.match(/\(\s*(kgs?|t|tonnes?|gbp|£)\s*\)/);
  if (bracket) {
    const unit = bracket[1]!;
    unitHint = unit.startsWith('kg') ? 'kg' : unit === 'gbp' || unit === '£' ? 'gbp' : 't';
    text = text.replace(bracket[0], ' ');
  } else {
    const trailing = text.match(/(?:^|\s)(£|gbp|kg)\s*$/);
    if (trailing) {
      unitHint = trailing[1] === 'kg' ? 'kg' : 'gbp';
      text = text.slice(0, text.length - trailing[0].length);
    }
  }

  text = text
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { text, tokens: text === '' ? [] : text.split(' '), unitHint };
}

/* --------------------------------------------------------------------- dates */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function toIso(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

const malformed: ParsedIssue = { code: 'malformed_date', severity: 'error' };

/** Reads a date cell. Day-before-month order is assumed for slash, dash and dot dates (UK). */
export function parseDateCell(cell: Cell | undefined): Parsed<string> {
  if (isEmptyCell(cell)) return { value: null, empty: true };

  if (cell instanceof Date) {
    const iso = Number.isNaN(cell.getTime())
      ? null
      : toIso(cell.getUTCFullYear(), cell.getUTCMonth() + 1, cell.getUTCDate());
    return iso ? { value: iso } : { value: null, issue: malformed };
  }

  if (typeof cell === 'number') {
    if (cell >= 20000 && cell <= 80000) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(cell) * 86_400_000);
      const iso = toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
      if (iso) return { value: iso, issue: { code: 'excel_serial_date', severity: 'fixed' } };
    }
    return { value: null, issue: malformed };
  }

  const text = String(cell).trim();
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const iso = toIso(Number(match[1]), Number(match[2]), Number(match[3]));
    return iso ? { value: iso } : { value: null, issue: malformed };
  }
  match = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (match) {
    const iso = toIso(Number(match[3]), Number(match[2]), Number(match[1]));
    return iso ? { value: iso } : { value: null, issue: malformed };
  }
  match = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})$/);
  if (match) {
    const month = MONTHS.indexOf(match[2]!.slice(0, 3).toLowerCase()) + 1;
    const iso = month > 0 ? toIso(Number(match[3]), month, Number(match[1])) : null;
    return iso ? { value: iso } : { value: null, issue: malformed };
  }
  return { value: null, issue: malformed };
}

/* ------------------------------------------------------------------- numbers */

export type DecimalMode = 'dot' | 'comma' | 'mixed';

export interface DecimalInfo {
  mode: DecimalMode;
  /** The convention used when the mode is mixed; equal to the mode otherwise. */
  majority: 'dot' | 'comma';
}

const COMMA_EVIDENCE = /^\d{1,3}(\.\d{3})+,\d+$|^\d+,\d{1,2}$/;
const DOT_EVIDENCE = /^\d{1,3}(,\d{3})+\.\d+$|^\d+\.\d{1,2}$/;

const KG_UNITS = new Set(['kg', 'kgs', 'kilogram', 'kilograms']);
const TONNE_UNITS = new Set(['t', 'tonne', 'tonnes', 'ton', 'tons', 'mt']);

interface SplitNumber {
  negative: boolean;
  /** Digits, dots and commas only. */
  body: string;
  /** Anything after the number (a unit or a currency code), lower case, no trailing dot. */
  suffix: string;
  /** A currency symbol before the number. */
  prefix: string;
}

/** Splits "£1,200.50", "12,5 t" or "28 kg" into body, prefix and suffix. Null if it is not numeric. */
function splitNumber(text: string): SplitNumber | null {
  const cleaned = text.replace(/[  ]/g, ' ').trim();
  const match = cleaned.match(/^([£€$¥]?)\s*([-+]?)\s*(\d[\d.,\s]*?)\s*([A-Za-z£€$¥]*)\.?$/);
  if (!match) return null;
  const body = match[3]!.replace(/(?<=\d)\s+(?=\d)/g, '').replace(/\s+/g, '');
  if (!/^\d[\d.,]*$/.test(body)) return null;
  return {
    prefix: match[1]!,
    negative: match[2] === '-',
    body,
    suffix: match[4]!.toLowerCase(),
  };
}

/** The numeric body of a string cell with units and currency removed, for convention detection. */
function numericBody(cell: Cell): string | null {
  if (typeof cell !== 'string') return null;
  return splitNumber(cell)?.body ?? null;
}

export function detectDecimalMode(values: readonly Cell[]): DecimalInfo {
  let comma = 0;
  let dot = 0;
  for (const value of values) {
    const body = numericBody(value);
    if (body === null) continue;
    if (COMMA_EVIDENCE.test(body)) comma += 1;
    else if (DOT_EVIDENCE.test(body)) dot += 1;
  }
  if (comma > 0 && dot > 0) return { mode: 'mixed', majority: comma > dot ? 'comma' : 'dot' };
  if (comma > 0) return { mode: 'comma', majority: 'comma' };
  return { mode: 'dot', majority: 'dot' };
}

export interface ParsedNumber extends Parsed<number> {
  /** A unit found inside the cell. It always wins over the column's default unit. */
  unit?: 'kg' | 't';
}

const unsupportedValue: ParsedIssue = { code: 'unsupported_value', severity: 'review' };

/** Reads a mass or money cell using the column's decimal convention. */
export function parseNumberCell(
  cell: Cell | undefined,
  decimal: DecimalInfo,
  kind: 'mass' | 'money',
): ParsedNumber {
  if (isEmptyCell(cell)) return { value: null, empty: true };

  if (typeof cell === 'number') {
    return Number.isFinite(cell) && cell >= 0
      ? { value: cell }
      : { value: null, issue: unsupportedValue };
  }
  if (typeof cell !== 'string') return { value: null, issue: unsupportedValue };

  const split = splitNumber(cell);
  if (!split) {
    // A currency word or symbol with no readable number is more useful to name than "unsupported".
    if (kind === 'money' && /[€$¥]|\b(eur|usd|cny|inr|try)\b/i.test(cell)) {
      return { value: null, issue: { code: 'unsupported_currency', severity: 'review' } };
    }
    return { value: null, issue: unsupportedValue };
  }

  let unit: 'kg' | 't' | undefined;
  if (kind === 'mass') {
    if (split.prefix !== '') return { value: null, issue: unsupportedValue };
    if (split.suffix !== '') {
      if (KG_UNITS.has(split.suffix)) unit = 'kg';
      else if (TONNE_UNITS.has(split.suffix)) unit = 't';
      else return { value: null, issue: { code: 'unsupported_unit', severity: 'review' } };
    }
  } else {
    if (split.prefix !== '' && split.prefix !== '£') {
      return { value: null, issue: { code: 'unsupported_currency', severity: 'review' } };
    }
    if (split.suffix !== '' && split.suffix !== 'gbp') {
      return { value: null, issue: { code: 'unsupported_currency', severity: 'review' } };
    }
  }

  if (decimal.mode === 'mixed') {
    const evidence = COMMA_EVIDENCE.test(split.body)
      ? 'comma'
      : DOT_EVIDENCE.test(split.body)
        ? 'dot'
        : null;
    if (evidence !== null && evidence !== decimal.majority) {
      return { value: null, issue: { code: 'ambiguous_number', severity: 'review' } };
    }
  }

  const convention = decimal.mode === 'mixed' ? decimal.majority : decimal.mode;
  const normalised =
    convention === 'comma'
      ? split.body.replace(/\./g, '').replace(',', '.')
      : split.body.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(normalised)) return { value: null, issue: unsupportedValue };

  const value = Number(normalised);
  if (split.negative && value !== 0) return { value: null, issue: unsupportedValue };

  const result: ParsedNumber = { value };
  if (unit) {
    result.unit = unit;
    result.issue = { code: 'unit_in_numeric', severity: 'fixed' };
  }
  return result;
}

/* ---------------------------------------------------------------- other text */

export function normaliseCommodityCode(cell: Cell | undefined): Parsed<string> {
  if (isEmptyCell(cell)) return { value: null, empty: true };
  let digits: string;
  let changed = false;
  if (typeof cell === 'number') {
    digits = Number.isFinite(cell) ? String(Math.trunc(cell)) : '';
  } else {
    const text = cellText(cell);
    digits = text.replace(/[\s.-]/g, '');
    changed = digits !== text;
  }
  if (!/^\d{6,10}$/.test(digits)) {
    return { value: null, issue: { code: 'invalid_commodity_code', severity: 'error' } };
  }
  return changed
    ? { value: digits, issue: { code: 'commodity_code_normalised', severity: 'fixed' } }
    : { value: digits };
}

export function normaliseCountry(cell: Cell | undefined): Parsed<string> {
  if (isEmptyCell(cell)) return { value: null, empty: true };
  const match = matchCountry(cellText(cell));
  if (match.kind === 'code') return { value: match.code };
  if (match.kind === 'name') {
    return { value: match.code, issue: { code: 'country_name_normalised', severity: 'fixed' } };
  }
  return { value: null, issue: { code: 'unknown_country', severity: 'note' } };
}

export type DeclarationValue = 'verified' | 'unverified' | 'none';

export function normaliseDeclaration(cell: Cell | undefined): Parsed<DeclarationValue> {
  if (isEmptyCell(cell)) return { value: 'none' };
  const text = cellText(cell);
  if (/unverified/i.test(text)) {
    return { value: 'unverified', issue: { code: 'unverified_declaration', severity: 'note' } };
  }
  if (/verified|actual|yes/i.test(text)) return { value: 'verified' };
  if (/^(none|no|n\/?a|nil|-+)$/i.test(text)) return { value: 'none' };
  return { value: null, issue: { code: 'unrecognised_declaration', severity: 'note' } };
}

export function normaliseCurrency(cell: Cell | undefined): Parsed<'GBP'> {
  if (isEmptyCell(cell)) return { value: 'GBP' };
  const text = cellText(cell).toUpperCase();
  if (text === 'GBP' || text === '£') return { value: 'GBP' };
  return { value: null, issue: { code: 'unsupported_currency', severity: 'review' } };
}

export function normaliseText(cell: Cell | undefined, maxLength: number): Parsed<string> {
  if (isEmptyCell(cell)) return { value: null, empty: true };
  const text = cellText(cell).replace(/\s+/g, ' ');
  if (text.length > maxLength) {
    return {
      value: text.slice(0, maxLength).trimEnd(),
      issue: { code: 'text_truncated', severity: 'note' },
    };
  }
  return { value: text };
}

/** Matches "Total", "Grand total", "Subtotal" as a whole cell, so "Total Energies Ltd" is kept. */
const TOTAL_CELL = /^\s*(grand[\s-]+)?(sub[\s-]?)?totals?\s*:?\s*$/i;

export function isTotalCell(cell: Cell | undefined): boolean {
  return typeof cell === 'string' && TOTAL_CELL.test(cell);
}
