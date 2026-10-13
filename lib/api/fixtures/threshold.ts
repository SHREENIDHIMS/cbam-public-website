import 'server-only';
import { rules } from '@/lib/config/rules';
import { toolsConfig } from '@/lib/config/tools';
import { evaluateThreshold, worstStatus } from '@/lib/tools/threshold';
import {
  backwardExplanation,
  forwardExplanation,
  thresholdNextStep,
} from '@/lib/tools/threshold-copy';
import {
  thresholdCheckResultSchema,
  type ThresholdCheckInput,
  type ThresholdCheckResult,
} from '../schemas';

const TO_BE_CONFIRMED =
  'The registration threshold is to be confirmed, so this view cannot be assessed yet.';

export function buildThresholdFixture(input: ThresholdCheckInput): ThresholdCheckResult {
  const threshold = rules.registrationThreshold.value?.amount ?? null;
  const bands = toolsConfig.thresholdGuidanceBands;
  const evaluation = evaluateThreshold(input, threshold, bands);
  const onlyNone = input.sectors.length === 1 && input.sectors[0] === 'none';

  const meta = {
    rulesVersion: rules.rulesVersion,
    dataSource: 'fixture' as const,
    thresholdAmount: threshold,
    thresholdProvenance: rules.registrationThreshold.status,
    guidance: { ...bands },
  };

  if (!evaluation || threshold === null) {
    const empty = {
      amount: null,
      ratio: null,
      status: null,
      basis: 'not_assessed' as const,
      explanation: TO_BE_CONFIRMED,
    };
    return thresholdCheckResultSchema.parse({
      ...meta,
      backward: empty,
      forward: empty,
      nextStep: thresholdNextStep(null, { onlyNone }),
    });
  }

  const { backward, forward } = evaluation;
  return thresholdCheckResultSchema.parse({
    ...meta,
    backward: {
      ...backward,
      explanation: backwardExplanation(
        backward.amount ?? 0,
        backward.ratio ?? 0,
        backward.status ?? 'below',
        threshold,
      ),
    },
    forward: {
      ...forward,
      explanation: forwardExplanation(
        forward.basis,
        forward.amount,
        forward.ratio,
        forward.status,
        threshold,
      ),
    },
    nextStep: thresholdNextStep(worstStatus(backward.status, forward.status), { onlyNone }),
  });
}
