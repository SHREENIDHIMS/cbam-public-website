import { cn } from '@/lib/utils/cn';

/**
 * A ruled horizontal measure: a filled bar to the value, dashed ticks at the product guidance
 * bands and a 2px rule at the threshold. The accessible name carries the same facts; the
 * surrounding text repeats them, so the drawing is never the only signal.
 */
export function RuledMeasure({
  ratio,
  ticks,
  label,
  className,
}: {
  /** Value as a fraction of the threshold. Values above 1 fill the bar. */
  ratio: number;
  /** Guidance band starts as fractions of the threshold. */
  ticks: readonly number[];
  label: string;
  className?: string;
}) {
  const fill = Math.min(Math.max(ratio, 0), 1);
  return (
    <div role="img" aria-label={label} className={cn('relative h-3 w-full', className)}>
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-surface-alt" />
      <div
        className="bar-grow absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-primary"
        style={{ width: `${fill * 100}%` }}
      />
      {ticks.map((tick) => (
        <span
          key={tick}
          className="absolute inset-y-0 border-l border-dashed border-ink"
          style={{ left: `${tick * 100}%` }}
        />
      ))}
      <span className="absolute -inset-y-1 right-0 border-l-2 border-ink" />
    </div>
  );
}
