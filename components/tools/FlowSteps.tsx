import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const FLOW_STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'headings', label: 'Check headings' },
  { key: 'mapping', label: 'Map columns' },
  { key: 'validation', label: 'Validate rows' },
  { key: 'scope', label: 'Resolve scope' },
  { key: 'preview', label: 'Preview' },
] as const;
export type FlowStepKey = (typeof FLOW_STEPS)[number]['key'];

/** Six-step progress. A numbered list from md up; a text line and thin bar on small screens. */
export function FlowSteps({ current }: { current: FlowStepKey }) {
  const index = FLOW_STEPS.findIndex((step) => step.key === current);
  const total = FLOW_STEPS.length;
  const label = FLOW_STEPS[index]?.label ?? '';

  return (
    <nav aria-label="Upload progress">
      <p className="text-sm font-semibold text-ink md:hidden">
        <span className="tabular-nums">
          Step {index + 1} of {total}
        </span>
        <span aria-hidden="true"> · </span>
        {label}
      </p>
      <div aria-hidden="true" className="mt-2 flex h-1.5 gap-1 md:hidden">
        {FLOW_STEPS.map((step, position) => (
          <span
            key={step.key}
            className={cn(
              'flex-1 transition-colors duration-300',
              position <= index ? 'bg-primary' : 'bg-line',
            )}
          />
        ))}
      </div>

      <ol className="m-0 hidden list-none items-start gap-0 p-0 md:flex">
        {FLOW_STEPS.map((step, position) => {
          const done = position < index;
          const active = position === index;
          return (
            <li
              key={step.key}
              aria-current={active ? 'step' : undefined}
              className="relative flex flex-1 flex-col items-start gap-2"
            >
              <div className="flex w-full items-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    't-figure flex size-8 shrink-0 items-center justify-center rounded-xs border text-sm font-semibold transition-colors duration-200',
                    done && 'border-primary bg-primary text-on-primary',
                    active && 'border-primary bg-primary-tint text-primary ring-2 ring-primary/25',
                    !done && !active && 'border-line-strong bg-surface text-ink-subtle',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : position + 1}
                </span>
                {position < total - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mx-2 h-px flex-1 transition-colors duration-300',
                      done ? 'bg-primary' : 'bg-line-strong',
                    )}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  'text-sm',
                  active ? 'font-semibold text-ink' : done ? 'text-ink-muted' : 'text-ink-subtle',
                )}
              >
                {step.label}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
