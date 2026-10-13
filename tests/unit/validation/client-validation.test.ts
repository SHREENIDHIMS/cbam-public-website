import { describe, expect, it } from 'vitest';
import {
  EMPTY_ANSWERS,
  completeAnswers,
  validateStep,
  type QuickEstimateAnswers,
} from '@/lib/validation/quick-estimate-fields';
import { STEP_SCHEMAS } from '@/lib/validation/quick-estimate';
import {
  THRESHOLD_MAX_VALUE,
  validateThreshold,
  type ThresholdFormValues,
} from '@/lib/validation/threshold';

const valid: QuickEstimateAnswers = {
  value: '25k_50k',
  sectors: ['cement'],
  origins: ['china'],
  suppliers: '2_5',
  large: 'no',
};

const KEYS = ['value', 'sectors', 'origins', 'suppliers', 'large'] as const;

describe('browser quick estimate checks agree with the Zod schemas', () => {
  const cases: Array<Partial<QuickEstimateAnswers>> = [
    {},
    { value: '' },
    { value: 'huge' as never },
    { sectors: [] },
    { sectors: ['unsure', 'cement'] },
    { sectors: ['gold' as never] },
    { sectors: ['unsure'] },
    { origins: [] },
    { origins: ['unsure', 'india'] },
    { origins: ['mars' as never] },
    { suppliers: '' },
    { suppliers: '6_20' },
    { large: '' },
    { large: 'maybe' as never },
  ];
  for (const patch of cases) {
    it(`step results match for ${JSON.stringify(patch)}`, () => {
      const answers = { ...valid, ...patch };
      STEP_SCHEMAS.forEach((schema, step) => {
        const key = KEYS[step] as (typeof KEYS)[number];
        const zod = schema.safeParse({ [key]: answers[key] });
        const mine = validateStep(step, answers);
        expect(mine === null).toBe(zod.success);
        // Unknown keys cannot come from the UI; Zod words those differently, so compare wording
        // only for the answers a visitor can actually produce.
        const unknownKey = JSON.stringify(patch).match(/huge|gold|mars|maybe/);
        if (!zod.success && !unknownKey) expect(mine).toBe(zod.error.issues[0]?.message);
      });
    });
  }

  it('returns complete answers only when every step is valid', () => {
    expect(completeAnswers(valid)).toEqual(valid);
    expect(completeAnswers(EMPTY_ANSWERS)).toBeNull();
    expect(completeAnswers({ ...valid, origins: [] })).toBeNull();
  });
});

describe('threshold form checks', () => {
  const base: ThresholdFormValues = {
    sectors: [],
    annualValue: 45_000,
    lumpy: false,
    nextThirtyDays: null,
  };

  it('accepts a yearly value with optional fields empty', () => {
    expect(validateThreshold({ ...base, sectors: [] })).toMatchObject({ success: true });
  });

  it('needs a yearly value', () => {
    const result = validateThreshold({ ...base, annualValue: undefined });
    expect(result).toEqual({
      success: false,
      errors: { annualValue: 'Enter your yearly value as a number' },
    });
  });

  it('rejects negative and oversized amounts', () => {
    expect(validateThreshold({ ...base, annualValue: -1 })).toMatchObject({
      errors: { annualValue: 'Your yearly value cannot be negative' },
    });
    expect(validateThreshold({ ...base, nextThirtyDays: THRESHOLD_MAX_VALUE + 1 })).toMatchObject({
      errors: { nextThirtyDays: 'That amount is larger than this tool can handle' },
    });
  });

  it('keeps "Not sure" and "None of these" exclusive', () => {
    expect(validateThreshold({ ...base, sectors: ['unsure', 'cement'] })).toMatchObject({
      success: false,
      errors: { sectors: expect.stringContaining('on their own') },
    });
    expect(validateThreshold({ ...base, sectors: ['none'] }).success).toBe(true);
  });
});
