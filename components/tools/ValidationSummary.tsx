import { CircleCheck, TriangleAlert } from 'lucide-react';
import type { ClientSummary } from '@/lib/api/schemas';
import { validationHeading } from '@/lib/upload/issue-copy';
import type { ColumnNote } from '@/lib/upload/validate-rows';
import { formatInteger } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'good' | 'watch' | 'bad';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'text-ink',
  good: 'text-positive-fg',
  watch: 'text-watch-fg',
  bad: 'text-critical-fg',
};

/** Row counts and the headline for the validation step. Column notes come first. */
export function ValidationSummary({
  counts,
  notes,
}: {
  counts: ClientSummary;
  notes: readonly ColumnNote[];
}) {
  const reviewCount = counts.needsReview + counts.duplicates + counts.rejected;
  const ready = counts.included - counts.normalised;
  const tiles: Array<{ label: string; value: number; tone: Tone; hint: string }> = [
    { label: 'Rows found', value: counts.rowsFound, tone: 'neutral', hint: 'Below the headings' },
    { label: 'Ready', value: ready, tone: 'good', hint: 'Used as they are' },
    { label: 'Normalised', value: counts.normalised, tone: 'good', hint: 'Tidied and used' },
    {
      label: 'Need review',
      value: counts.needsReview,
      tone: counts.needsReview > 0 ? 'watch' : 'neutral',
      hint: 'Left out',
    },
    {
      label: 'Duplicates',
      value: counts.duplicates,
      tone: counts.duplicates > 0 ? 'watch' : 'neutral',
      hint: 'Left out',
    },
    {
      label: 'Rejected',
      value: counts.rejected,
      tone: counts.rejected > 0 ? 'bad' : 'neutral',
      hint: 'Left out',
    },
    {
      label: 'Totals skipped',
      value: counts.totalRowsExcluded,
      tone: 'neutral',
      hint: 'Not imported',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        {reviewCount === 0 ? (
          <CircleCheck aria-hidden="true" className="mt-1 size-6 shrink-0 text-positive-fg" />
        ) : (
          <TriangleAlert aria-hidden="true" className="mt-1 size-6 shrink-0 text-watch-fg" />
        )}
        <p className="t-title">{validationHeading(counts)}</p>
      </div>

      {notes.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {notes.map((note) => (
            <li
              key={`${note.field}-${note.code}`}
              className="rounded-md border border-line bg-info-bg px-4 py-2.5 text-sm text-info-fg"
            >
              {note.message}
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-md border border-line bg-surface px-3 py-3"
            data-tile={tile.label}
          >
            <dt className="text-xs font-medium text-ink-subtle">{tile.label}</dt>
            <dd
              className={cn('m-0 mt-1 text-2xl font-semibold tabular-nums', TONE_CLASS[tile.tone])}
            >
              {formatInteger(tile.value)}
            </dd>
            <dd className="m-0 text-xs text-ink-subtle">{tile.hint}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
