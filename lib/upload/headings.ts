import { toolsConfig } from '@/lib/config/tools';
import { UPLOAD_FIELDS } from '@/lib/config/upload-fields';
import { scoreHeaderForField, type DataRowLike } from './column-matching';
import { cellText, isEmptyCell, normaliseHeader } from './normalise';
import type { Cell, ParsedSheet } from './types';

const HEADER_CELL_THRESHOLD = 0.65;
const MIN_HEADER_CELLS = 3;

export interface DiscoveredHeadings {
  /** Zero-based index of the heading row within the sheet. */
  headerRowIndex: number;
  headers: string[];
  /** Rows above the headings that were skipped. */
  skippedAbove: number;
  dataRows: DataRowLike[];
  blankRowsSkipped: number;
}

export type HeadingResult =
  { ok: true; value: DiscoveredHeadings } | { ok: false; error: 'no_headings' };

function bestFieldScore(cell: Cell | undefined): number {
  if (isEmptyCell(cell) || typeof cell !== 'string') return 0;
  const header = normaliseHeader(cell);
  let best = 0;
  for (const field of UPLOAD_FIELDS) {
    best = Math.max(best, scoreHeaderForField(header, field).score);
  }
  return best;
}

/**
 * Finds the heading row among the first rows: the row with the most cells that look like a known
 * heading (earliest wins a tie, minimum three). Everything below it is data; blank rows are dropped.
 */
export function discoverHeadings(
  rows: readonly (readonly Cell[])[],
  scanRows: number = toolsConfig.upload.headerScanRows,
): HeadingResult {
  let bestIndex = -1;
  let bestCount = 0;
  const limit = Math.min(scanRows, rows.length);
  for (let index = 0; index < limit; index += 1) {
    const count = (rows[index] ?? []).filter(
      (cell) => bestFieldScore(cell) >= HEADER_CELL_THRESHOLD,
    ).length;
    if (count > bestCount) {
      bestCount = count;
      bestIndex = index;
    }
  }
  if (bestIndex === -1 || bestCount < MIN_HEADER_CELLS) return { ok: false, error: 'no_headings' };

  const headerCells = rows[bestIndex] ?? [];
  const headers = headerCells.map((cell) => cellText(cell));
  const dataRows: DataRowLike[] = [];
  let blankRowsSkipped = 0;
  for (let index = bestIndex + 1; index < rows.length; index += 1) {
    const cells = rows[index] ?? [];
    if (cells.every((cell) => isEmptyCell(cell))) {
      blankRowsSkipped += 1;
      continue;
    }
    dataRows.push({ rowNumber: index + 1, cells });
  }
  return {
    ok: true,
    value: {
      headerRowIndex: bestIndex,
      headers,
      skippedAbove: bestIndex,
      dataRows,
      blankRowsSkipped,
    },
  };
}

export interface SheetChoice {
  sheetIndex: number;
  headings: DiscoveredHeadings;
  /** Set when the first sheet had no headings and a later one was used. */
  switchedFrom: { from: string; to: string } | null;
}

export type SheetPick = { ok: true; value: SheetChoice } | { ok: false; error: 'no_headings' };

/** The first sheet, unless it has no headings; then the first sheet that does. */
export function pickSheet(sheets: readonly ParsedSheet[]): SheetPick {
  for (let index = 0; index < sheets.length; index += 1) {
    const result = discoverHeadings(sheets[index]!.rows);
    if (result.ok) {
      return {
        ok: true,
        value: {
          sheetIndex: index,
          headings: result.value,
          switchedFrom: index > 0 ? { from: sheets[0]!.name, to: sheets[index]!.name } : null,
        },
      };
    }
  }
  return { ok: false, error: 'no_headings' };
}

export type DataRowCheck =
  | { ok: true }
  | { ok: false; error: 'no_data_rows' }
  | { ok: false; error: 'row_limit'; count: number };

export function checkDataRows(
  headings: DiscoveredHeadings,
  maxRows: number = toolsConfig.upload.maxDataRows,
): DataRowCheck {
  if (headings.dataRows.length === 0) return { ok: false, error: 'no_data_rows' };
  if (headings.dataRows.length > maxRows) {
    return { ok: false, error: 'row_limit', count: headings.dataRows.length };
  }
  return { ok: true };
}
