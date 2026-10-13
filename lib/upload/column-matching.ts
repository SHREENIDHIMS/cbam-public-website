import {
  UPLOAD_FIELDS,
  getUploadField,
  type FieldKind,
  type UploadField,
  type UploadFieldKey,
} from '@/lib/config/upload-fields';
import {
  detectDecimalMode,
  isEmptyCell,
  isTotalCell,
  normaliseCommodityCode,
  normaliseHeader,
  parseDateCell,
  parseNumberCell,
  type NormalisedHeader,
} from './normalise';
import type { Cell, ColumnChoice, Confidence } from './types';

const GENERIC_CAP = 0.75;
const MIN_SCORE = 0.5;
const SAMPLE_SIZE = 20;

/** Optimal-string-alignment distance (Damerau-Levenshtein with adjacent transpositions). */
export function damerauLevenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) d[i]![0] = i;
  for (let j = 0; j < cols; j += 1) d[0]![j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = best;
    }
  }
  return d[a.length]![b.length]!;
}

export interface HeaderScore {
  score: number;
  reason: string;
}

/** Scores one normalised heading against one synonym. Returns 0 when there is no match. */
export function scoreHeader(
  header: NormalisedHeader,
  synonym: { text: string; generic: boolean },
): HeaderScore {
  if (header.text === '') return { score: 0, reason: '' };
  const synonymTokens = synonym.text.split(' ');
  let score = 0;
  let reason = '';

  if (header.text === synonym.text) {
    score = 1;
    reason = 'Exact heading';
  } else if (synonymTokens.every((token) => header.tokens.includes(token))) {
    const extra = header.tokens.length - synonymTokens.length;
    score = Math.max(0.6, 0.85 - 0.05 * extra);
    reason = `Heading contains '${synonym.text}'`;
  } else {
    const distance = damerauLevenshtein(header.text, synonym.text);
    const similarity = 1 - distance / Math.max(header.text.length, synonym.text.length);
    if (similarity >= 0.8) {
      score = 0.9 * similarity;
      reason = `Close spelling of '${synonym.text}'`;
    }
  }
  if (score > 0 && synonym.generic) score = Math.min(score, GENERIC_CAP);
  return { score, reason };
}

export function scoreHeaderForField(header: NormalisedHeader, field: UploadField): HeaderScore {
  let best: HeaderScore = { score: 0, reason: '' };
  for (const synonym of field.synonyms) {
    const candidate = scoreHeader(header, synonym);
    if (candidate.score > best.score) best = candidate;
  }
  return best;
}

export function confidenceFor(score: number): Exclude<Confidence, 'manual'> {
  if (score >= 0.9) return 'high';
  if (score >= 0.65) return 'medium';
  if (score >= MIN_SCORE) return 'low';
  return 'none';
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: 'High match',
  medium: 'Possible match: check',
  low: 'Low match: check',
  none: 'Not used',
  manual: 'Set by you',
};

const CONTENT_KINDS: readonly FieldKind[] = ['code', 'date', 'mass', 'money'];

const KIND_LABEL: Record<string, string> = {
  code: 'commodity codes',
  date: 'dates',
  mass: 'weights',
  money: 'amounts',
};

/** The share of sample values that read as the field's kind, or null if the kind is not checked. */
function parseRate(kind: FieldKind, samples: readonly Cell[]): number | null {
  if (!CONTENT_KINDS.includes(kind) || samples.length === 0) return null;
  const decimal = detectDecimalMode(samples);
  let ok = 0;
  for (const sample of samples) {
    if (kind === 'code') {
      if (normaliseCommodityCode(sample).value !== null) ok += 1;
    } else if (kind === 'date') {
      if (parseDateCell(sample).value !== null) ok += 1;
    } else {
      const parsed = parseNumberCell(sample, decimal, kind === 'mass' ? 'mass' : 'money');
      if (parsed.value !== null) ok += 1;
    }
  }
  return ok / samples.length;
}

export interface MappingSuggestion {
  columnIndex: number;
  header: string;
  field: ColumnChoice;
  score: number;
  confidence: Confidence;
  reason: string;
  unitHint: NormalisedHeader['unitHint'];
}

export interface DataRowLike {
  rowNumber: number;
  cells: readonly Cell[];
}

function sampleColumn(dataRows: readonly DataRowLike[], columnIndex: number): Cell[] {
  const samples: Cell[] = [];
  for (const row of dataRows) {
    if (row.cells.some(isTotalCell)) continue;
    const cell = row.cells[columnIndex];
    if (isEmptyCell(cell)) continue;
    samples.push(cell ?? null);
    if (samples.length >= SAMPLE_SIZE) break;
  }
  return samples;
}

/**
 * Suggests one field per column. Scores come from the heading text and are adjusted by whether
 * the values below look like the field's kind. Assignment is greedy and one to one.
 */
export function suggestMapping(
  headers: readonly string[],
  dataRows: readonly DataRowLike[],
): MappingSuggestion[] {
  const normalised = headers.map((header) => normaliseHeader(header));
  const suggestions: MappingSuggestion[] = headers.map((header, columnIndex) => ({
    columnIndex,
    header,
    field: 'ignore',
    score: 0,
    confidence: 'none',
    reason: '',
    unitHint: normalised[columnIndex]!.unitHint,
  }));

  interface Pair {
    columnIndex: number;
    field: UploadField;
    priority: number;
    score: number;
    reason: string;
  }
  const pairs: Pair[] = [];

  normalised.forEach((header, columnIndex) => {
    if (header.text === '') return;
    const samples = sampleColumn(dataRows, columnIndex);
    UPLOAD_FIELDS.forEach((field, priority) => {
      const base = scoreHeaderForField(header, field);
      if (base.score === 0) return;
      let { score, reason } = base;
      const rate = parseRate(field.kind, samples);
      if (rate !== null) {
        if (rate >= 0.8) {
          score = Math.min(1, score + 0.05);
          reason = `${reason}; values look like ${KIND_LABEL[field.kind]}`;
        } else if (rate < 0.5) {
          score -= 0.25;
          reason = `Values do not look like ${KIND_LABEL[field.kind]}`;
        }
      }
      if (score >= MIN_SCORE) pairs.push({ columnIndex, field, priority, score, reason });
    });
  });

  pairs.sort(
    (a, b) => b.score - a.score || a.priority - b.priority || a.columnIndex - b.columnIndex,
  );

  const usedFields = new Set<UploadFieldKey>();
  const usedColumns = new Set<number>();
  for (const pair of pairs) {
    if (usedFields.has(pair.field.key) || usedColumns.has(pair.columnIndex)) continue;
    usedFields.add(pair.field.key);
    usedColumns.add(pair.columnIndex);
    const target = suggestions[pair.columnIndex]!;
    target.field = pair.field.key;
    target.score = pair.score;
    target.confidence = confidenceFor(pair.score);
    target.reason = pair.reason;
  }
  return suggestions;
}

export interface ManualChangeResult {
  mapping: MappingSuggestion[];
  /** Set when choosing a field took it away from another column, for a live-region message. */
  moved: { fromHeader: string; toHeader: string; field: UploadFieldKey } | null;
}

/** Applies a visitor's choice. A field can only be read from one column, so it moves. */
export function applyManualChange(
  mapping: readonly MappingSuggestion[],
  columnIndex: number,
  choice: ColumnChoice,
): ManualChangeResult {
  let moved: ManualChangeResult['moved'] = null;
  const next = mapping.map((entry) => {
    if (entry.columnIndex === columnIndex) {
      return {
        ...entry,
        field: choice,
        confidence: (choice === 'ignore' ? 'none' : 'manual') as Confidence,
        reason: choice === 'ignore' ? 'You chose not to use this column' : 'You chose this column',
      };
    }
    if (choice !== 'ignore' && entry.field === choice) {
      moved = {
        fromHeader: entry.header,
        toHeader: mapping[columnIndex]?.header ?? '',
        field: choice,
      };
      return {
        ...entry,
        field: 'ignore' as const,
        confidence: 'none' as const,
        reason: `Moved to another column`,
      };
    }
    return entry;
  });
  return { mapping: next, moved };
}

export type FieldColumns = Partial<Record<UploadFieldKey, number>>;

export function toFieldColumns(mapping: readonly MappingSuggestion[]): FieldColumns {
  const columns: FieldColumns = {};
  for (const entry of mapping) {
    if (entry.field !== 'ignore') columns[entry.field] = entry.columnIndex;
  }
  return columns;
}

/** Required fields with no column, in field order. */
export function missingRequiredFields(mapping: readonly MappingSuggestion[]): UploadFieldKey[] {
  const columns = toFieldColumns(mapping);
  return UPLOAD_FIELDS.filter(
    (field) => field.requirement === 'required' && columns[field.key] === undefined,
  ).map((field) => field.key);
}

export function fieldLabel(key: UploadFieldKey): string {
  return getUploadField(key).label;
}

/** The unit named in the Net mass heading, if any. */
export function massUnitHint(mapping: readonly MappingSuggestion[]): 'kg' | 't' | null {
  const entry = mapping.find((candidate) => candidate.field === 'netMass');
  return entry?.unitHint === 'kg' || entry?.unitHint === 't' ? entry.unitHint : null;
}
