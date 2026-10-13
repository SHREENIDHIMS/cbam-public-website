import { describe, expect, it } from 'vitest';
import { calculateRelief } from '@/lib/tools/relief';

const base = {
  massTonnes: 100,
  intensity: 2,
  rate: 10,
  coveredShare: 1,
  effectivePrice: 3,
  evidenceInPlace: true,
};

describe('calculateRelief', () => {
  it('multiplies mass, intensity and rate, then takes relief off the end', () => {
    expect(calculateRelief(base)).toEqual({
      embodiedEmissions: 200,
      coveredEmissions: 200,
      gross: 2000,
      relief: 600,
      net: 1400,
      reliefExceedsGross: false,
    });
  });

  it('claims no relief without evidence', () => {
    const result = calculateRelief({ ...base, evidenceInPlace: false });
    expect(result.relief).toBe(0);
    expect(result.net).toBe(result.gross);
  });

  it('only counts the share of emissions covered by a carbon price', () => {
    const result = calculateRelief({ ...base, coveredShare: 0.5 });
    expect(result.coveredEmissions).toBe(100);
    expect(result.relief).toBe(300);
  });

  it('flags relief larger than the gross figure without modelling the outcome', () => {
    expect(calculateRelief({ ...base, effectivePrice: 20 }).reliefExceedsGross).toBe(true);
  });
});
