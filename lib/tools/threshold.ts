import type { ThresholdStatus } from '@/lib/config/status';

/**
 * Compares visitor-entered totals with a threshold and the product guidance bands.
 * No scope resolution and no liability maths (DECISIONS 19.3). "Triggered" means at or above the
 * threshold: GOV.UK words both tests as "£50,000 or more", so exactly equal is triggered.
 */

export interface GuidanceBands {
  watchFrom: number;
  approachingFrom: number;
}

export type ForwardBasis = 'entered' | 'even_spread' | 'not_assessed';

export interface ThresholdInput {
  annualValue: number;
  nextThirtyDays: number | null;
  lumpy: boolean;
}

export interface ThresholdViewResult {
  amount: number | null;
  ratio: number | null;
  status: ThresholdStatus | null;
}

export interface ThresholdEvaluation {
  backward: ThresholdViewResult & { basis: 'entered' };
  forward: ThresholdViewResult & { basis: ForwardBasis };
}

export function classifyRatio(ratio: number, bands: GuidanceBands): ThresholdStatus {
  if (ratio >= 1) return 'triggered';
  if (ratio >= bands.approachingFrom) return 'approaching';
  if (ratio >= bands.watchFrom) return 'watch';
  return 'below';
}

export function evenSpreadThirtyDays(annual: number): number {
  return (annual * 30) / 365;
}

/** Returns null when the threshold is not known (the page then says "to be confirmed"). */
export function evaluateThreshold(
  input: ThresholdInput,
  thresholdAmount: number | null,
  bands: GuidanceBands,
): ThresholdEvaluation | null {
  if (thresholdAmount === null || thresholdAmount <= 0) return null;

  const backwardRatio = input.annualValue / thresholdAmount;
  const backward: ThresholdEvaluation['backward'] = {
    amount: input.annualValue,
    ratio: backwardRatio,
    status: classifyRatio(backwardRatio, bands),
    basis: 'entered',
  };

  let forward: ThresholdEvaluation['forward'];
  if (input.nextThirtyDays !== null) {
    const ratio = input.nextThirtyDays / thresholdAmount;
    forward = {
      amount: input.nextThirtyDays,
      ratio,
      status: classifyRatio(ratio, bands),
      basis: 'entered',
    };
  } else if (input.lumpy) {
    forward = { amount: null, ratio: null, status: null, basis: 'not_assessed' };
  } else {
    const amount = evenSpreadThirtyDays(input.annualValue);
    const ratio = amount / thresholdAmount;
    forward = { amount, ratio, status: classifyRatio(ratio, bands), basis: 'even_spread' };
  }

  return { backward, forward };
}

const SEVERITY: Record<ThresholdStatus, number> = {
  below: 0,
  watch: 1,
  approaching: 2,
  triggered: 3,
};

/** The more serious of two statuses; null is ignored. */
export function worstStatus(
  a: ThresholdStatus | null,
  b: ThresholdStatus | null,
): ThresholdStatus | null {
  if (a === null) return b;
  if (b === null) return a;
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}
