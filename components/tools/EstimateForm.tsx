'use client';

import {
  LARGE_SHIPMENT_OPTIONS,
  SUPPLIER_BANDS,
  VALUE_BANDS,
} from '@/lib/config/quick-estimate-options';
import type { SectorKey } from '@/lib/config/sector-keys';
import type { QuickEstimateAnswers } from '@/lib/validation/quick-estimate-fields';
import { CountrySelector } from './CountrySelector';
import { RangeSelector } from './RangeSelector';
import { SectorSelector } from './SectorSelector';

export const STEP_FIELD_IDS = [
  'qe-value',
  'qe-sectors',
  'qe-origins',
  'qe-suppliers',
  'qe-large',
] as const;

export const STEP_COPY = [
  {
    title: 'About how much do you import each year?',
    description:
      'The customs value of goods that could be CBAM goods. A rough range is fine; you can say you do not know yet.',
  },
  {
    title: 'Which sectors are relevant?',
    description:
      'Choose every group your goods might fall into. Not sure? Say so and we will note it.',
  },
  {
    title: 'Where do the goods mostly come from?',
    description: 'Pick the main regions of origin. A rough idea is enough.',
  },
  {
    title: 'Roughly how many suppliers do you buy from?',
    description: 'Producer emissions data is collected supplier by supplier, so the count matters.',
  },
  {
    title: 'Do you ever receive very large shipments?',
    description:
      'A single big shipment can matter for the forward-looking 30-day test even when your yearly total looks modest.',
  },
] as const;

interface EstimateFormProps {
  /** Zero-based step index. */
  step: number;
  answers: QuickEstimateAnswers;
  onChange: (patch: Partial<QuickEstimateAnswers>) => void;
  errors: Partial<Record<keyof QuickEstimateAnswers, string>>;
  sectors: ReadonlyArray<{ key: SectorKey; label: string }>;
}

/** Renders the controls for one wizard step. The step heading is the visible question. */
export function EstimateForm({ step, answers, onChange, errors, sectors }: EstimateFormProps) {
  const question = STEP_COPY[step]?.title ?? '';
  const legend = <span className="sr-only">{question}</span>;

  switch (step) {
    case 0:
      return (
        <RangeSelector
          id={STEP_FIELD_IDS[0]}
          legend={legend}
          options={VALUE_BANDS.map((band) => ({ value: band.key, label: band.label }))}
          value={answers.value}
          onChange={(value) => onChange({ value: value as QuickEstimateAnswers['value'] })}
          error={errors.value}
        />
      );
    case 1:
      return (
        <SectorSelector
          id={STEP_FIELD_IDS[1]}
          legend={legend}
          sectors={sectors}
          value={answers.sectors}
          onChange={(next) => onChange({ sectors: next as QuickEstimateAnswers['sectors'] })}
          error={errors.sectors}
        />
      );
    case 2:
      return (
        <CountrySelector
          id={STEP_FIELD_IDS[2]}
          legend={legend}
          value={answers.origins}
          onChange={(next) => onChange({ origins: next as QuickEstimateAnswers['origins'] })}
          error={errors.origins}
        />
      );
    case 3:
      return (
        <RangeSelector
          id={STEP_FIELD_IDS[3]}
          legend={legend}
          options={SUPPLIER_BANDS.map((band) => ({
            value: band.key,
            label: band.label,
          }))}
          value={answers.suppliers}
          onChange={(value) => onChange({ suppliers: value as QuickEstimateAnswers['suppliers'] })}
          error={errors.suppliers}
        />
      );
    default:
      return (
        <RangeSelector
          id={STEP_FIELD_IDS[4]}
          legend={legend}
          columns="one"
          options={LARGE_SHIPMENT_OPTIONS.map((option) => ({
            value: option.key,
            label: option.label,
            description: option.description,
          }))}
          value={answers.large}
          onChange={(value) => onChange({ large: value as QuickEstimateAnswers['large'] })}
          error={errors.large}
        />
      );
  }
}
