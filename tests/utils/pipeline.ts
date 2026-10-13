import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { suggestMapping, massUnitHint, type MappingSuggestion } from '@/lib/upload/column-matching';
import { checkDataRows, pickSheet } from '@/lib/upload/headings';
import { buildPreviewRequest } from '@/lib/upload/build-payload';
import { parseWorkbook } from '@/lib/upload/parse-file';
import { sha256Hex } from '@/lib/upload/hash-file';
import { validateRows } from '@/lib/upload/validate-rows';
import type { MassUnit } from '@/lib/upload/types';

export function readFixture(name: string): ArrayBuffer {
  const buffer = readFileSync(join(process.cwd(), 'tests', 'fixtures', name));
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/** Runs the same steps the upload flow runs in the browser, on a committed fixture file. */
export async function runPipeline(
  name: string,
  overrides?: (m: MappingSuggestion[]) => MappingSuggestion[],
) {
  const buffer = readFixture(name);
  const fileType = name.endsWith('.csv') ? 'csv' : 'xlsx';
  const sheets = await parseWorkbook(buffer, fileType);
  const pick = pickSheet(sheets);
  if (!pick.ok) throw new Error('no headings');
  const { headings, sheetIndex, switchedFrom } = pick.value;
  const dataCheck = checkDataRows(headings);
  let mapping = suggestMapping(headings.headers, headings.dataRows);
  if (overrides) mapping = overrides(mapping);
  const hint = massUnitHint(mapping);
  const massUnit: MassUnit = hint === 't' ? 'tonnes' : 'kg';
  const validation = validateRows(headings.dataRows, mapping, {
    massUnit,
    massUnitFromHeading: hint !== null,
  });
  const fileSha256 = await sha256Hex(buffer);
  const sheetName = fileType === 'csv' ? null : sheets[sheetIndex]!.name;
  const request =
    validation.payloadRows.length > 0
      ? buildPreviewRequest({ fileSha256, fileType, sheetName, validation })
      : null;
  return { sheets, headings, switchedFrom, dataCheck, mapping, validation, request, fileSha256 };
}
