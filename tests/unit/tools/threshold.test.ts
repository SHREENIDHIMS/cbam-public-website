import { describe, expect, it } from 'vitest';
import {
  classifyRatio,
  evaluateThreshold,
  evenSpreadThirtyDays,
  worstStatus,
} from '@/lib/tools/threshold';
import { toolsConfig } from '@/lib/config/tools';

const bands = toolsConfig.thresholdGuidanceBands;
const T = 1000;

describe('classifyRatio', () => {
  it.each([
    [0.5999, 'below'],
    [0.6, 'watch'],
    [0.7999, 'watch'],
    [0.8, 'approaching'],
    [1, 'triggered'],
    [1.0001, 'triggered'],
  ] as const)('%s is %s', (ratio, status) => {
    expect(classifyRatio(ratio, bands)).toBe(status);
  });
});

describe('evaluateThreshold', () => {
  it('returns null when the threshold is unknown', () => {
    expect(
      evaluateThreshold({ annualValue: 5, nextThirtyDays: null, lumpy: false }, null, bands),
    ).toBeNull();
  });

  it('uses entered 30-day values', () => {
    const result = evaluateThreshold(
      { annualValue: 900, nextThirtyDays: 1200, lumpy: false },
      T,
      bands,
    );
    expect(result?.backward.status).toBe('approaching');
    expect(result?.forward).toMatchObject({ basis: 'entered', status: 'triggered' });
  });

  it('does not assess the forward view for lumpy imports without an amount', () => {
    const result = evaluateThreshold(
      { annualValue: 900, nextThirtyDays: null, lumpy: true },
      T,
      bands,
    );
    expect(result?.forward).toMatchObject({ basis: 'not_assessed', status: null });
  });

  it('spreads evenly otherwise', () => {
    const result = evaluateThreshold(
      { annualValue: 3650, nextThirtyDays: null, lumpy: false },
      T,
      bands,
    );
    expect(evenSpreadThirtyDays(3650)).toBe(300);
    expect(result?.forward).toMatchObject({ basis: 'even_spread', amount: 300, status: 'below' });
  });

  it('picks the worst status', () => {
    expect(worstStatus('watch', 'triggered')).toBe('triggered');
    expect(worstStatus(null, 'below')).toBe('below');
  });
});
