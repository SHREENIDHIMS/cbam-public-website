import type { FileType } from './file-checks';
import type { Cell, ParsedSheet } from './types';

/**
 * The only module that imports a file parser, and always through `import()`, so the parser code
 * is a separate chunk that loads when a file is chosen. Nothing here logs or stores cell values.
 */

export class ParseError extends Error {
  constructor() {
    super('parse_error');
    this.name = 'ParseError';
  }
}

const loadPapa = () => import('papaparse');
const loadXlsx = () => import('read-excel-file/universal');

/** Starts downloading the parser chunks so choosing a file feels instant. */
export function preloadParsers(): void {
  void loadPapa();
  void loadXlsx();
}

function decodeCsv(buffer: ArrayBuffer): string {
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    // Legacy exports from Windows tools are often windows-1252.
    text = new TextDecoder('windows-1252').decode(buffer);
  }
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

const DELIMITERS = [',', ';', '\t'] as const;

/**
 * Picks the delimiter that splits the most early rows into the same number of fields. Papa's own
 * guess is thrown by free text containing commas inside a semicolon-separated export.
 */
function guessDelimiter(
  Papa: Awaited<ReturnType<typeof loadPapa>>['default'],
  text: string,
): string {
  let best: string = ',';
  let bestRows = 0;
  let bestFields = 0;
  for (const delimiter of DELIMITERS) {
    const { data } = Papa.parse<string[]>(text, { delimiter, preview: 30, skipEmptyLines: true });
    const tally = new Map<number, number>();
    for (const row of data) {
      if (row.length < 2) continue;
      tally.set(row.length, (tally.get(row.length) ?? 0) + 1);
    }
    for (const [fields, rows] of tally) {
      if (rows > bestRows || (rows === bestRows && fields > bestFields)) {
        best = delimiter;
        bestRows = rows;
        bestFields = fields;
      }
    }
  }
  return best;
}

async function parseCsv(buffer: ArrayBuffer): Promise<ParsedSheet[]> {
  const text = decodeCsv(buffer);
  // Let the "Checking your file" message paint before the parse blocks the main thread.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const Papa = (await loadPapa()).default;
  const delimiter = guessDelimiter(Papa, text);
  const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: false, delimiter });
  const rows: Cell[][] = result.data.map((row) => row.map((cell) => (cell === '' ? null : cell)));
  return [{ name: 'CSV', rows }];
}

async function parseXlsx(buffer: ArrayBuffer): Promise<ParsedSheet[]> {
  const readXlsx = (await loadXlsx()).default;
  const sheets = await readXlsx(buffer);
  return sheets.map((sheet) => ({
    name: sheet.sheet,
    rows: sheet.data.map((row) => row.map((cell) => (cell === undefined ? null : (cell as Cell)))),
  }));
}

/** Parses every sheet of a workbook, or the single sheet of a CSV. Throws ParseError on failure. */
export async function parseWorkbook(
  buffer: ArrayBuffer,
  fileType: FileType,
): Promise<ParsedSheet[]> {
  try {
    const sheets = fileType === 'csv' ? await parseCsv(buffer) : await parseXlsx(buffer);
    if (sheets.length === 0) throw new ParseError();
    return sheets;
  } catch {
    throw new ParseError();
  }
}
