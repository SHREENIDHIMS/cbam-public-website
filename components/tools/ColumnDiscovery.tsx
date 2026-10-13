import type { ReactNode } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Alert } from '@/components/shared/Alert';
import { getUploadField } from '@/lib/config/upload-fields';
import type { MappingSuggestion } from '@/lib/upload/column-matching';
import type { DiscoveredHeadings } from '@/lib/upload/headings';
import { formatInteger } from '@/lib/utils/format';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FilePreview } from './FilePreview';

interface ColumnDiscoveryProps {
  headings: DiscoveredHeadings;
  mapping: readonly MappingSuggestion[];
  sheetNotice: string | null;
  sheetPicker: ReactNode;
}

/** Step 2: what we found in the file, before the visitor maps anything. */
export function ColumnDiscovery({
  headings,
  mapping,
  sheetNotice,
  sheetPicker,
}: ColumnDiscoveryProps) {
  const detected = mapping.filter((entry) => entry.field !== 'ignore');
  const skipped = headings.skippedAbove;

  return (
    <div className="flex flex-col gap-6">
      {sheetPicker}
      {sheetNotice ? <Alert tone="info">{sheetNotice}</Alert> : null}

      <p className="text-ink">
        We found <strong>{formatInteger(headings.headers.length)} columns</strong> and{' '}
        <strong>{formatInteger(headings.dataRows.length)} data rows</strong>
        {skipped > 0
          ? `. We skipped ${skipped} ${skipped === 1 ? 'row' : 'rows'} above the headings.`
          : '.'}
      </p>

      <FilePreview
        headers={headings.headers}
        rows={headings.dataRows}
        caption="The headings and first rows of your file"
      />
      <p className="-mt-3 flex items-center gap-2 text-sm text-ink-subtle">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        This preview stays in your browser.
      </p>

      <section aria-labelledby="detected-title">
        <h3 id="detected-title" className="text-base font-semibold text-ink">
          What we think each column is
        </h3>
        <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2">
          {detected.map((entry) => (
            <li
              key={entry.columnIndex}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-md border border-line bg-surface px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                <span className="truncate font-medium">{entry.header}</span>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-ink-subtle" />
                <span className="sr-only">read as</span>
                <span className="whitespace-nowrap text-ink-muted">
                  {entry.field === 'ignore' ? '' : getUploadField(entry.field).label}
                </span>
              </span>
              <ConfidenceBadge confidence={entry.confidence} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-muted">You can change any of these on the next step.</p>
      </section>
    </div>
  );
}
