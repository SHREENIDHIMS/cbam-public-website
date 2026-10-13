import 'server-only';
import { rules } from '@/lib/config/rules';
import type { SectorKey } from '@/lib/config/rules-schema';
import { toolsConfig, getValueBand, type NextActionKey } from '@/lib/config/tools';
import {
  quickEstimateResultSchema,
  type QuickEstimateInput,
  type QuickEstimateResult,
} from '../schemas';
import { formatGBP } from '@/lib/utils/format';

type Status = QuickEstimateResult['status'];

const ACTION_LABELS: Record<NextActionKey, string> = {
  upload: 'Upload customs data for a data-backed preview',
  threshold: 'Test the numbers in the threshold checker',
  guides: 'Read the plain-English guides',
  quick_estimate: 'Go back and add what you know',
};

const ACTIONS_BY_STATUS: Record<Status, NextActionKey[]> = {
  below: ['threshold', 'guides'],
  approaching: ['upload', 'threshold'],
  likely_triggered: ['upload', 'guides'],
  needs_data: ['upload', 'quick_estimate'],
};

export const LARGE_SHIPMENT_REASON =
  'A single large shipment can meet the forward-looking 30-day test even when the yearly total is low.';

function classify(
  input: QuickEstimateInput,
  threshold: number | null,
): { status: Status; reasons: string[] } {
  const band = getValueBand(input.value);
  if (input.value === 'unknown' || threshold === null) {
    return {
      status: 'needs_data',
      reasons: [
        threshold === null
          ? 'The registration threshold is to be confirmed, so the range cannot be compared yet.'
          : 'You did not have a yearly value to hand, so there is nothing to compare with the threshold yet.',
      ],
    };
  }

  const thresholdText = formatGBP(threshold);
  const { approachingFrom } = toolsConfig.thresholdGuidanceBands;
  const high = band.max ?? Number.POSITIVE_INFINITY;

  let status: Status;
  const reasons: string[] = [];
  if (band.min !== null && band.min >= threshold) {
    status = 'likely_triggered';
    reasons.push(
      `The lowest value in the range you chose (${band.label}) is already at or above the ${thresholdText} threshold.`,
    );
  } else if (high > approachingFrom * threshold) {
    status = 'approaching';
    reasons.push(
      `The range you chose (${band.label}) reaches into the product's approaching band for the ${thresholdText} threshold.`,
    );
  } else {
    status = 'below';
    reasons.push(
      `The range you chose (${band.label}) stays below the ${thresholdText} threshold, and below the approaching band.`,
    );
  }

  if (status === 'below' && input.large === 'yes') {
    status = 'approaching';
    reasons.push(LARGE_SHIPMENT_REASON);
  } else if (input.large === 'yes') {
    reasons.push(LARGE_SHIPMENT_REASON);
  }
  return { status, reasons };
}

export function buildQuickEstimateFixture(input: QuickEstimateInput): QuickEstimateResult {
  const threshold = rules.registrationThreshold.value?.amount ?? null;
  const band = getValueBand(input.value);
  const { status, reasons } = classify(input, threshold);

  const selected = input.sectors.filter((sector): sector is SectorKey => sector !== 'unsure');
  const unsure = input.sectors.includes('unsure');

  const confidenceReasons: string[] = [];
  let lowConfidence = false;
  const note = (text: string) => {
    lowConfidence = true;
    confidenceReasons.push(text);
  };
  if (unsure && selected.length === 0) note('You were not sure which sectors apply.');
  if (input.suppliers === 'unknown') note('The number of suppliers is unknown.');
  if (input.large === 'unsure') note('You were not sure about large shipments.');
  if (status === 'needs_data') note('There was not enough information to compare.');
  if (confidenceReasons.length === 0) {
    confidenceReasons.push(
      'Ranges are broad. A quick estimate never reaches high confidence; customs data would.',
    );
  }

  return quickEstimateResultSchema.parse({
    rulesVersion: rules.rulesVersion,
    dataSource: 'fixture',
    status,
    valueRange: { low: band.min, high: band.max },
    threshold: { amount: threshold, provenance: rules.registrationThreshold.status },
    sectorExposure: {
      selected,
      main: selected.length === 1 ? (selected[0] ?? null) : null,
      unsure,
    },
    reasons,
    confidence: {
      level: lowConfidence ? 'low' : 'medium',
      reasons: confidenceReasons,
    },
    nextActions: ACTIONS_BY_STATUS[status].map((key) => ({ key, label: ACTION_LABELS[key] })),
  });
}
