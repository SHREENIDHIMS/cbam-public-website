import type { ThresholdStatus } from '@/lib/config/status';
import { formatGBP, formatPercent } from '@/lib/utils/format';
import type { ForwardBasis } from './threshold';

/** Plain-English sentences shared by the threshold checker island and the fixture adapter. */

export const STATUS_SENTENCES: Record<ThresholdStatus, string> = {
  below: 'That is comfortably below the threshold on the figures entered.',
  watch: 'That is below the threshold but inside the watch band, so keep an eye on it.',
  approaching: 'That is close to the threshold. Real customs data would give a more reliable view.',
  triggered: 'That is at or above the threshold on the figures entered.',
};

export const EVEN_SPREAD_LABEL =
  'Assumes imports are spread evenly over the year (a simplification).';

export const LUMPY_PROMPT =
  'Enter your largest expected 30-day amount. Lumpy imports can cross the forward-looking test even when the yearly total is low.';

export function backwardExplanation(
  amount: number,
  ratio: number,
  status: ThresholdStatus,
  thresholdAmount: number,
): string {
  return `${formatGBP(amount)} is ${formatPercent(ratio)} of the ${formatGBP(thresholdAmount)} threshold. ${STATUS_SENTENCES[status]}`;
}

export function forwardExplanation(
  basis: ForwardBasis,
  amount: number | null,
  ratio: number | null,
  status: ThresholdStatus | null,
  thresholdAmount: number,
): string {
  if (basis === 'not_assessed' || amount === null || ratio === null || status === null) {
    return LUMPY_PROMPT;
  }
  const lead =
    basis === 'even_spread'
      ? `${EVEN_SPREAD_LABEL} That gives about ${formatGBP(amount)} over 30 days, ${formatPercent(ratio)} of the ${formatGBP(thresholdAmount)} threshold.`
      : `${formatGBP(amount)} expected over the next 30 days is ${formatPercent(ratio)} of the ${formatGBP(thresholdAmount)} threshold.`;
  return `${lead} ${STATUS_SENTENCES[status]}`;
}

export function thresholdNextStep(
  worst: ThresholdStatus | null,
  options: { onlyNone: boolean },
): string {
  if (options.onlyNone) {
    return 'If none of your goods are in these sectors, CBAM may not apply. Check the commodity code against the guidance.';
  }
  switch (worst) {
    case 'triggered':
      return 'Confirm the position with your customs data. Upload a file to see which lines count and which suppliers matter.';
    case 'approaching':
      return 'Check the figures against real customs data. A file upload shows which lines count towards the total.';
    case 'watch':
      return 'Revisit this when your volumes change, and consider checking a recent customs export.';
    case 'below':
      return 'No action needed on these figures. Re-check if your import plans change.';
    default:
      return 'Enter your largest expected 30-day amount to complete the forward-looking view.';
  }
}
