import type { QuickEstimateInput } from '@/lib/api/schemas';
import { SECTOR_KEYS } from '@/lib/config/sector-keys';
import {
  LARGE_SHIPMENT_KEYS,
  ORIGIN_GROUP_KEYS,
  SUPPLIER_BAND_KEYS,
  VALUE_BAND_KEYS,
} from '@/lib/config/quick-estimate-options';

/**
 * Quick estimate answers, per-step checks and the URL encoding, with no schema library so the
 * browser wizard stays light. lib/validation/quick-estimate.ts holds the Zod schemas that the
 * server uses for the same rules; a unit test keeps the two in agreement.
 */

export const SEARCH_PARAM_VERSION = '1';

export type QuickEstimateAnswers = {
  value: QuickEstimateInput['value'] | '';
  sectors: QuickEstimateInput['sectors'];
  origins: QuickEstimateInput['origins'];
  suppliers: QuickEstimateInput['suppliers'] | '';
  large: QuickEstimateInput['large'] | '';
};

export const EMPTY_ANSWERS: QuickEstimateAnswers = {
  value: '',
  sectors: [],
  origins: [],
  suppliers: '',
  large: '',
};

export const exclusiveUnsure = (values: readonly string[]) =>
  !values.includes('unsure') || values.length === 1;

const includes = (list: readonly string[], value: unknown): boolean =>
  typeof value === 'string' && list.includes(value);

const SECTOR_CHOICES = [...SECTOR_KEYS, 'unsure'];

function checkList(
  values: readonly string[],
  allowed: readonly string[],
  empty: string,
  mixed: string,
): string | null {
  if (values.length === 0) return empty;
  if (!values.every((value) => allowed.includes(value))) return empty;
  return exclusiveUnsure(values) ? null : mixed;
}

/** Error message for the answers on one step (zero-based), or null when they are valid. */
export function validateStep(step: number, answers: QuickEstimateAnswers): string | null {
  switch (step) {
    case 0:
      return includes(VALUE_BAND_KEYS, answers.value)
        ? null
        : 'Choose the closest yearly value range';
    case 1:
      return checkList(
        answers.sectors,
        SECTOR_CHOICES,
        'Choose at least one sector, or "Not sure"',
        'Choose "Not sure" on its own, or pick sectors',
      );
    case 2:
      return checkList(
        answers.origins,
        ORIGIN_GROUP_KEYS,
        'Choose at least one origin, or "Not sure"',
        'Choose "Not sure" on its own, or pick origins',
      );
    case 3:
      return includes(SUPPLIER_BAND_KEYS, answers.suppliers)
        ? null
        : 'Choose the closest supplier count';
    default:
      return includes(LARGE_SHIPMENT_KEYS, answers.large) ? null : 'Choose one answer';
  }
}

/** The answers as a complete input when every step is valid, otherwise null. */
export function completeAnswers(answers: QuickEstimateAnswers): QuickEstimateInput | null {
  for (let step = 0; step < 5; step += 1) {
    if (validateStep(step, answers) !== null) return null;
  }
  return answers as QuickEstimateInput;
}

export function toSearchParams(answers: QuickEstimateInput): string {
  const params = new URLSearchParams();
  params.set('v', SEARCH_PARAM_VERSION);
  params.set('value', answers.value);
  params.set('sectors', answers.sectors.join(','));
  params.set('origins', answers.origins.join(','));
  params.set('suppliers', answers.suppliers);
  params.set('large', answers.large);
  // Keep commas readable in the address bar.
  return params.toString().replace(/%2C/g, ',');
}

export function answersFromInput(input: QuickEstimateInput): QuickEstimateAnswers {
  return { ...input };
}
