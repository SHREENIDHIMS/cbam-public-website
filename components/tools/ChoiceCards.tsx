'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { InlineFieldError } from '@/components/shared/InlineFieldError';
import { cn } from '@/lib/utils/cn';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

interface ChoiceCardsProps {
  /** Becomes the fieldset id so an error summary can link to it. */
  id: string;
  legend: ReactNode;
  hint?: string;
  type: 'radio' | 'checkbox';
  options: readonly ChoiceOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  /** Value that clears every other choice when picked (for example "Not sure"). */
  exclusiveValue?: string;
  /** Values in this list are shown after a divider and read as exclusive too. */
  exclusiveValues?: readonly string[];
  error?: string | undefined;
  columns?: 'one' | 'two';
}

/**
 * Native radio or checkbox inputs presented as cards. Keyboard behaviour is the browser's own:
 * arrow keys inside a radio group, Space on a checkbox. A tick icon and the border show the
 * selected state, so it is never colour alone.
 */
export function ChoiceCards({
  id,
  legend,
  hint,
  type,
  options,
  value,
  onChange,
  exclusiveValue,
  exclusiveValues = exclusiveValue ? [exclusiveValue] : [],
  error,
  columns = 'two',
}: ChoiceCardsProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  function toggle(option: string) {
    if (type === 'radio') {
      onChange([option]);
      return;
    }
    const selected = value.includes(option);
    if (exclusiveValues.includes(option)) {
      onChange(selected ? [] : [option]);
      return;
    }
    const withoutExclusive = value.filter((entry) => !exclusiveValues.includes(entry));
    onChange(
      selected
        ? withoutExclusive.filter((entry) => entry !== option)
        : [...withoutExclusive, option],
    );
  }

  return (
    <fieldset
      id={id}
      tabIndex={-1}
      aria-describedby={describedBy || undefined}
      aria-invalid={error ? true : undefined}
      className="m-0 min-w-0 border-0 p-0"
    >
      <legend className="mb-1 p-0 text-base font-semibold text-ink">{legend}</legend>
      {hint ? (
        <p id={hintId} className="mb-4 max-w-prose text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      <div className={cn('mt-3 grid grid-cols-1 gap-3', columns === 'two' && 'sm:grid-cols-2')}>
        {options.map((option) => {
          const checked = value.includes(option.value);
          const inputId = `${id}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={cn(
                'relative flex min-h-14 cursor-pointer items-start gap-3 rounded-sm border bg-surface px-4 py-3.5 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                checked
                  ? 'border-primary bg-primary-tint shadow-[inset_0_0_0_1px_var(--cc-primary)]'
                  : 'border-line-strong hover:border-ink',
              )}
            >
              <input
                id={inputId}
                type={type}
                name={id}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center border',
                  type === 'radio' ? 'rounded-full' : 'rounded-xs',
                  checked
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line-strong bg-surface text-transparent',
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-sm text-ink-muted">{option.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      <InlineFieldError id={errorId} message={error} />
    </fieldset>
  );
}
