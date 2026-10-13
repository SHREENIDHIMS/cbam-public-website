'use client';

import type { ReactNode } from 'react';
import type { SectorKey } from '@/lib/config/rules-schema';
import { ChoiceCards } from './ChoiceCards';

interface SectorSelectorProps {
  id: string;
  legend: ReactNode;
  hint?: string;
  sectors: ReadonlyArray<{ key: SectorKey; label: string }>;
  /** Extra exclusive choices such as "None of these". */
  extraOptions?: ReadonlyArray<{ value: string; label: string; description?: string }>;
  value: readonly string[];
  onChange: (next: string[]) => void;
  error?: string | undefined;
}

/** Sector checkboxes plus "Not sure". The sector list always comes from the rules summary. */
export function SectorSelector({
  sectors,
  extraOptions = [],
  value,
  ...rest
}: SectorSelectorProps) {
  const options = [
    ...sectors.map((sector) => ({ value: sector.key, label: sector.label })),
    { value: 'unsure', label: 'Not sure', description: 'We will say so in the confidence note.' },
    ...extraOptions,
  ];
  return (
    <ChoiceCards
      {...rest}
      type="checkbox"
      options={options}
      value={value}
      exclusiveValues={['unsure', ...extraOptions.map((option) => option.value)]}
    />
  );
}
