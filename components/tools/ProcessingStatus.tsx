import { Check, LoaderCircle, Circle } from 'lucide-react';
import { formatInteger } from '@/lib/utils/format';

type Phase = 'sending' | 'done';

/** Progress of the preview request. The busy item is announced, never animated alone. */
export function ProcessingStatus({ rows, phase }: { rows: number; phase: Phase }) {
  const items = [
    {
      label: `Sending ${formatInteger(rows)} mapped ${rows === 1 ? 'row' : 'rows'}`,
      state: 'done',
    },
    {
      label: phase === 'done' ? 'Resolved CBAM scope' : 'Resolving CBAM scope…',
      state: phase === 'done' ? 'done' : 'busy',
    },
    {
      label: 'Preparing the preview',
      state: phase === 'done' ? 'done' : 'waiting',
    },
  ] as const;

  return (
    <ol
      aria-busy={phase !== 'done'}
      aria-label="Preview progress"
      className="m-0 flex list-none flex-col gap-3 p-0"
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 text-ink">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-xs bg-surface-alt"
          >
            {item.state === 'done' ? (
              <Check className="size-4 text-positive-fg" strokeWidth={3} />
            ) : item.state === 'busy' ? (
              <LoaderCircle className="size-4 animate-spin text-primary motion-reduce:animate-none" />
            ) : (
              <Circle className="size-3 text-ink-subtle" />
            )}
          </span>
          <span className={item.state === 'waiting' ? 'text-ink-subtle' : undefined}>
            {item.label}
            <span className="sr-only">
              {item.state === 'done'
                ? ' (done)'
                : item.state === 'busy'
                  ? ' (in progress)'
                  : ' (waiting)'}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
