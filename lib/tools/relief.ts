import { round2, roundMoney } from './money';

/**
 * Arithmetic for the carbon price relief illustration. Every input is a scenario value the visitor
 * can change. It shows how relief moves an indicative figure; it does not decide eligibility.
 */

export interface ReliefInputs {
  massTonnes: number;
  /** Embodied emissions intensity, tCO2e per tonne. */
  intensity: number;
  /** Scenario CBAM rate, pounds per tCO2e. */
  rate: number;
  /** Share of the embodied emissions covered by the carbon price, from 0 to 1. */
  coveredShare: number;
  /** Effective carbon price paid at origin, pounds per tCO2e. */
  effectivePrice: number;
  /** Whether the evidence for a claim is in place. Without it the illustration claims no relief. */
  evidenceInPlace: boolean;
}

export interface ReliefResult {
  embodiedEmissions: number;
  coveredEmissions: number;
  gross: number;
  relief: number;
  net: number;
  /** True when relief is larger than the gross figure; how that case is treated is not modelled. */
  reliefExceedsGross: boolean;
}

export function calculateRelief(input: ReliefInputs): ReliefResult {
  const embodiedEmissions = round2(input.massTonnes * input.intensity);
  const coveredEmissions = round2(embodiedEmissions * input.coveredShare);
  const gross = roundMoney(embodiedEmissions * input.rate);
  const relief = input.evidenceInPlace ? roundMoney(coveredEmissions * input.effectivePrice) : 0;
  return {
    embodiedEmissions,
    coveredEmissions,
    gross,
    relief,
    net: roundMoney(gross - relief),
    reliefExceedsGross: relief > gross,
  };
}
