import { describe, expect, it } from 'vitest';
import {
  SAMPLE_LINE,
  SAMPLE_SUPPLIER_COVERAGE,
  SAMPLE_TWELVE_MONTH_VALUE,
  computeSampleLine,
  sampleBasisDifference,
  sampleCoverage,
  sampleThresholdStatus,
} from '@/lib/config/home-sample';
import { rules } from '@/lib/config/rules';

describe('homepage sample data', () => {
  it('works the sample line from emissions to net position', () => {
    expect(computeSampleLine(SAMPLE_LINE, 'default')).toEqual({
      emissions: 100.8,
      gross: 5040,
      relief: 806.4,
      net: 4233.6,
    });
    expect(computeSampleLine(SAMPLE_LINE, 'actual').net).toBe(3588.48);
  });

  it('shows a positive gap between the default and supplier actual basis', () => {
    expect(sampleBasisDifference()).toBe(645.12);
  });

  it('keeps supplier shares at 100% and reports only verified suppliers as covered', () => {
    const total = SAMPLE_SUPPLIER_COVERAGE.reduce((sum, supplier) => sum + supplier.valueShare, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(sampleCoverage()).toBeCloseTo(0.58, 10);
  });

  it('derives the sample threshold status from the rules threshold and guidance bands', () => {
    const threshold = rules.registrationThreshold.value?.amount ?? 0;
    expect(SAMPLE_TWELVE_MONTH_VALUE).toBeLessThan(threshold);
    expect(sampleThresholdStatus(threshold)).toBe('approaching');
    expect(sampleThresholdStatus(SAMPLE_TWELVE_MONTH_VALUE)).toBe('triggered');
    expect(sampleThresholdStatus(SAMPLE_TWELVE_MONTH_VALUE * 10)).toBe('below');
  });
});
