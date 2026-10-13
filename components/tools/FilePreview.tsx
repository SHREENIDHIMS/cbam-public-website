import { cellText } from '@/lib/upload/normalise';
import type { Cell } from '@/lib/upload/types';

const PREVIEW_ROWS = 5;
const MAX_CELL_CHARS = 48;

function shorten(text: string): string {
  return text.length > MAX_CELL_CHARS ? `${text.slice(0, MAX_CELL_CHARS - 1)}…` : text;
}

/** The heading row and the first data rows as they appear in the file. Shown on screen only. */
export function FilePreview({
  headers,
  rows,
  caption,
}: {
  headers: readonly string[];
  rows: ReadonlyArray<{ rowNumber: number; cells: readonly Cell[] }>;
  caption: string;
}) {
  const shown = rows.slice(0, PREVIEW_ROWS);
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="relative max-w-full overflow-x-auto rounded-md border border-line bg-surface"
    >
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-surface-alt">
            <th scope="col" className="px-3 py-2 text-xs font-medium text-ink-subtle tabular-nums">
              Row
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-3 py-2 text-xs font-semibold whitespace-nowrap text-ink"
              >
                {header || <span className="text-ink-subtle">(blank)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr key={row.rowNumber} className="border-t border-line">
              <th
                scope="row"
                className="px-3 py-2 text-xs font-normal text-ink-subtle tabular-nums"
              >
                {row.rowNumber}
              </th>
              {headers.map((_, index) => (
                <td key={index} className="px-3 py-2 whitespace-nowrap text-ink-muted">
                  {shorten(cellText(row.cells[index]))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
