import { formatDate } from '@/lib/utils/format';

export interface TimelineEntry {
  id: string;
  /** ISO date. Leave out for a point in time that is only known loosely, and give `dateLabel`. */
  date?: string;
  /** Text shown in place of a formatted date, for example "Autumn 2026". */
  dateLabel?: string;
  title: string;
  body?: string;
  /** Extra line shown under the body, for example the keys a change touched. */
  meta?: string;
  /** A short label such as "Official" or "Scenario", rendered as text beside the date. */
  tag?: string;
  /** True for a point in the future; drawn with a hollow marker. */
  upcoming?: boolean;
}

/** A vertical ruled timeline. Order is the order given. Marker shape plus text carries meaning. */
export function ChangelogTimeline({
  entries,
  label,
}: {
  entries: readonly TimelineEntry[];
  label: string;
}) {
  return (
    <ol aria-label={label} className="m-0 list-none p-0">
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-5 pb-10 last:pb-0">
          {index < entries.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-5 bottom-0 left-[0.4375rem] w-px bg-line-strong"
            />
          ) : null}
          <span
            aria-hidden="true"
            className={
              entry.upcoming
                ? 'relative mt-1.5 size-3.5 shrink-0 border-2 border-primary bg-canvas'
                : 'relative mt-1.5 size-3.5 shrink-0 border-2 border-primary bg-primary'
            }
          />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-subtle">
              {entry.date ? (
                <time dateTime={entry.date} className="font-medium text-ink">
                  {formatDate(entry.date)}
                </time>
              ) : (
                <span className="font-medium text-ink">
                  {entry.dateLabel ?? 'Date to be confirmed'}
                </span>
              )}
              {entry.upcoming ? <span>Upcoming</span> : null}
              {entry.tag ? <span>{entry.tag}</span> : null}
            </p>
            <h3 className="t-title mt-1">{entry.title}</h3>
            {entry.body ? <p className="mt-2 max-w-2xl text-ink-muted">{entry.body}</p> : null}
            {entry.meta ? <p className="mt-2 text-sm text-ink-subtle">{entry.meta}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
