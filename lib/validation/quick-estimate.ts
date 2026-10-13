import { z } from 'zod';
import './zod-browser';
import { SECTOR_KEYS } from '@/lib/config/sector-keys';
import {
  LARGE_SHIPMENT_KEYS,
  ORIGIN_GROUP_KEYS,
  SUPPLIER_BAND_KEYS,
  VALUE_BAND_KEYS,
} from '@/lib/config/tools';
import { quickEstimateInputSchema, type QuickEstimateInput } from '@/lib/api/schemas';
import {
  SEARCH_PARAM_VERSION,
  exclusiveUnsure,
  toSearchParams,
  answersFromInput,
  EMPTY_ANSWERS,
  type QuickEstimateAnswers,
} from './quick-estimate-fields';

export { SEARCH_PARAM_VERSION, toSearchParams, answersFromInput, EMPTY_ANSWERS };
export type { QuickEstimateAnswers };

/** Per-step validation for the quick estimate wizard and the URL encoding of its answers. */

const sectorChoice = z.union([z.enum(SECTOR_KEYS), z.literal('unsure')]);

export const step1Schema = z.object({
  value: z.enum(VALUE_BAND_KEYS, { error: 'Choose the closest yearly value range' }),
});
export const step2Schema = z.object({
  sectors: z
    .array(sectorChoice)
    .min(1, 'Choose at least one sector, or "Not sure"')
    .refine(exclusiveUnsure, 'Choose "Not sure" on its own, or pick sectors'),
});
export const step3Schema = z.object({
  origins: z
    .array(z.enum(ORIGIN_GROUP_KEYS))
    .min(1, 'Choose at least one origin, or "Not sure"')
    .refine(exclusiveUnsure, 'Choose "Not sure" on its own, or pick origins'),
});
export const step4Schema = z.object({
  suppliers: z.enum(SUPPLIER_BAND_KEYS, { error: 'Choose the closest supplier count' }),
});
export const step5Schema = z.object({
  large: z.enum(LARGE_SHIPMENT_KEYS, { error: 'Choose one answer' }),
});

export const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

export const quickEstimateAnswersSchema = quickEstimateInputSchema;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  const raw = first(value);
  return raw ? raw.split(',').filter(Boolean) : [];
}

export type ParsedSearchParams = { success: true; data: QuickEstimateInput } | { success: false };

/** Parses answer bands from the URL. Anything unknown, or a missing version, is rejected. */
export function parseQuickEstimateSearchParams(params: RawParams): ParsedSearchParams {
  if (first(params.v) !== SEARCH_PARAM_VERSION) return { success: false };
  const result = quickEstimateInputSchema.safeParse({
    value: first(params.value),
    sectors: list(params.sectors),
    origins: list(params.origins),
    suppliers: first(params.suppliers),
    large: first(params.large),
  });
  if (!result.success) return { success: false };
  if (!exclusiveUnsure(result.data.sectors) || !exclusiveUnsure(result.data.origins)) {
    return { success: false };
  }
  return { success: true, data: result.data };
}
