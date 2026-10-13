'use client';

import type { ReactNode } from 'react';
import { ORIGIN_GROUPS } from '@/lib/config/quick-estimate-options';
import { ChoiceCards } from './ChoiceCards';

interface CountrySelectorProps {
  id: string;
  legend: ReactNode;
  hint?: string;
  value: readonly string[];
  onChange: (next: string[]) => void;
  error?: string | undefined;
}

/** Origin groups as checkboxes. "Not sure" is exclusive. */
export function CountrySelector(props: CountrySelectorProps) {
  const options = ORIGIN_GROUPS.map((group) => ({
    value: group.key,
    label: group.label,
  }));
  return <ChoiceCards {...props} type="checkbox" options={options} exclusiveValue="unsure" />;
}
