'use client';

import type { ReactNode } from 'react';
import { ChoiceCards, type ChoiceOption } from './ChoiceCards';

interface RangeSelectorProps {
  id: string;
  legend: ReactNode;
  hint?: string;
  options: readonly ChoiceOption[];
  value: string;
  onChange: (next: string) => void;
  error?: string | undefined;
  columns?: 'one' | 'two';
}

/** A single-choice list of ranges shown as radio cards. */
export function RangeSelector({ value, onChange, ...rest }: RangeSelectorProps) {
  return (
    <ChoiceCards
      {...rest}
      type="radio"
      value={value ? [value] : []}
      onChange={(next) => onChange(next[0] ?? '')}
    />
  );
}
