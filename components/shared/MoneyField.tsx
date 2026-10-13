'use client';

import { useLayoutEffect, useRef, useState, type ChangeEvent } from 'react';
import { controlClass, fieldAria, Frame, type FieldFrame } from './NativeFields';

/** Keeps digits and one decimal point, with at most two decimal places. */
function sanitise(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot);
  const fraction = cleaned
    .slice(dot + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return `${whole}.${fraction}`;
}

/** Adds thousand separators to the whole part: "45000.5" becomes "45,000.5". */
function group(clean: string): string {
  const dot = clean.indexOf('.');
  const whole = dot === -1 ? clean : clean.slice(0, dot);
  const rest = dot === -1 ? '' : clean.slice(dot);
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + rest;
}

function toNumber(clean: string): number | undefined {
  if (clean === '' || clean === '.') return undefined;
  const value = Number(clean);
  return Number.isFinite(value) ? value : undefined;
}

interface MoneyFieldProps extends FieldFrame {
  placeholder?: string;
  prefix?: string;
  value: number | null | undefined;
  /** Called with the parsed amount, or undefined while the field is empty. */
  onValueChange: (next: number | undefined) => void;
  onBlur?: () => void;
}

/**
 * Currency amount as a plain text input: decimal keypad on phones, a visual prefix, thousand
 * separators as you type and the caret kept where you were typing. The label, description and error
 * are wired with the same ids and ARIA attributes as the other native fields.
 */
export function MoneyField({
  id,
  label,
  description,
  error,
  placeholder,
  prefix = '£',
  value,
  onValueChange,
  onBlur,
}: MoneyFieldProps) {
  const [text, setText] = useState(() =>
    value === null || value === undefined ? '' : group(String(value)),
  );
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caret.current !== null && input.current) {
      input.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [text]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.currentTarget.value;
    const position = event.currentTarget.selectionStart ?? raw.length;
    const clean = sanitise(raw);
    const formatted = group(clean);
    // Keep the caret after the same number of digits and decimal points as before reformatting.
    const significant = sanitise(raw.slice(0, position)).length;
    let seen = 0;
    let next = 0;
    while (next < formatted.length && seen < significant) {
      if (formatted[next] !== ',') seen += 1;
      next += 1;
    }
    caret.current = next;
    setText(formatted);
    onValueChange(toNumber(clean));
  }

  return (
    <Frame id={id} label={label} description={description} error={error}>
      <div className="relative">
        {prefix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted"
          >
            {prefix}
          </span>
        ) : null}
        <input
          ref={input}
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onChange={onChange}
          onBlur={onBlur}
          {...fieldAria({ id, label, description, error })}
          className={`${controlClass} h-12 ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </Frame>
  );
}
