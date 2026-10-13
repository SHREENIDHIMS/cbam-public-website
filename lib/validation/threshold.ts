import { SECTOR_KEYS, type SectorKey } from '@/lib/config/sector-keys';

/**
 * Form values and checks for the threshold checker. Plain functions with no schema library, so the
 * tool route does not ship Zod to the browser. Money fields hold a number, or nothing while empty.
 */

export const THRESHOLD_MAX_VALUE = 10_000_000_000;

export type ThresholdSector = SectorKey | 'unsure' | 'none';

export interface ThresholdFormValues {
  sectors: ThresholdSector[];
  annualValue: number | undefined;
  lumpy: boolean;
  nextThirtyDays: number | null;
}

export type ThresholdField = 'sectors' | 'annualValue' | 'nextThirtyDays';
export type ThresholdErrors = Partial<Record<ThresholdField, string>>;

export interface ValidThresholdValues {
  sectors: ThresholdSector[];
  annualValue: number;
  lumpy: boolean;
  nextThirtyDays: number | null;
}

export type ThresholdValidation =
  { success: true; data: ValidThresholdValues } | { success: false; errors: ThresholdErrors };

const SECTOR_CHOICES: readonly string[] = [...SECTOR_KEYS, 'unsure', 'none'];

function moneyError(value: number | null | undefined, label: string): string | undefined {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return `Enter ${label} as a number`;
  }
  if (value < 0) return `${label[0]?.toUpperCase()}${label.slice(1)} cannot be negative`;
  if (value > THRESHOLD_MAX_VALUE) return 'That amount is larger than this tool can handle';
  return undefined;
}

export function validateThreshold(values: ThresholdFormValues): ThresholdValidation {
  const errors: ThresholdErrors = {};
  const { sectors } = values;
  const exclusive = sectors.includes('unsure') || sectors.includes('none');
  if (
    !sectors.every((sector) => SECTOR_CHOICES.includes(sector)) ||
    (exclusive && sectors.length !== 1)
  ) {
    errors.sectors = 'Choose "Not sure" or "None of these" on their own, or pick sectors';
  }
  const annual = moneyError(values.annualValue, 'your yearly value');
  if (annual) errors.annualValue = annual;
  if (values.nextThirtyDays !== null) {
    const next = moneyError(values.nextThirtyDays, 'the next 30 days amount');
    if (next) errors.nextThirtyDays = next;
  }
  if (Object.keys(errors).length > 0 || values.annualValue === undefined) {
    return { success: false, errors };
  }
  return {
    success: true,
    data: {
      sectors,
      annualValue: values.annualValue,
      lumpy: values.lumpy,
      nextThirtyDays: values.nextThirtyDays,
    },
  };
}
