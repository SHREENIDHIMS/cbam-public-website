import type { ResultStatus } from './status';
import { SCENARIO_ASSUMPTIONS, SUPPLIER_ACTUALS } from './scenario-assumptions';
import { toolsConfig } from './tools';

/**
 * Fictional, illustrative figures for the homepage product visuals.
 *
 * Nothing here is a regulatory value. The scenario rate, the default emissions
 * intensity and the relief assumption are invented for the sample and are always shown
 * with their provenance label. The registration threshold is NOT stored here: visuals
 * read it from the rules config.
 */

export const SAMPLE_LABEL = 'Sample data · fictional importer · illustrative figures';

export const SAMPLE_IMPORTER = 'Northstar Steel Imports Ltd';

export const SAMPLE_SUPPLIERS = {
  atlas: 'Atlas Metals',
  meridian: 'Meridian Alloy Works',
  northChannel: 'North Channel Materials',
} as const;

/** Sample 12-month value of in-scope imports, used against the threshold from the rules config. */
export const SAMPLE_TWELVE_MONTH_VALUE = 41_250;

/** Sample 30-day forward estimate of in-scope imports. */
export const SAMPLE_THIRTY_DAY_VALUE = 9_800;

export function sampleThresholdStatus(threshold: number): ResultStatus {
  const ratio = SAMPLE_TWELVE_MONTH_VALUE / threshold;
  const { watchFrom, approachingFrom } = toolsConfig.thresholdGuidanceBands;
  if (ratio >= 1) return 'triggered';
  if (ratio >= approachingFrom) return 'approaching';
  if (ratio >= watchFrom) return 'watch';
  return 'below';
}

export type SupplierState = 'verified' | 'requested' | 'missing';

export interface SampleSupplier {
  name: string;
  state: SupplierState;
  /** Share of sample import value covered by this supplier. */
  valueShare: number;
}

export const SAMPLE_SUPPLIER_COVERAGE: readonly SampleSupplier[] = [
  { name: SAMPLE_SUPPLIERS.atlas, state: 'verified', valueShare: 0.58 },
  { name: SAMPLE_SUPPLIERS.meridian, state: 'requested', valueShare: 0.27 },
  { name: SAMPLE_SUPPLIERS.northChannel, state: 'missing', valueShare: 0.15 },
];

export const SAMPLE_EVIDENCE = { ready: 5, total: 8 } as const;

export const SAMPLE_SCENARIO_RANGE = { low: 14_200, high: 19_800 } as const;

/** Share of import value backed by supplier actual data. */
export function sampleCoverage(suppliers: readonly SampleSupplier[] = SAMPLE_SUPPLIER_COVERAGE) {
  return suppliers
    .filter((supplier) => supplier.state === 'verified')
    .reduce((sum, supplier) => sum + supplier.valueShare, 0);
}

/** One illustrative import line, worked end to end. */
export interface SampleLineInput {
  description: string;
  supplier: string;
  customsValue: number;
  quantityTonnes: number;
  /** Default emissions intensity, tCO2e per tonne. Illustrative. */
  defaultIntensity: number;
  /** Supplier actual intensity, tCO2e per tonne. Illustrative. */
  actualIntensity: number;
  /** Scenario rate, £ per tCO2e. Not an official rate. */
  scenarioRate: number;
  /** Scenario carbon price assumed paid at origin, £ per tCO2e. Not a verified relief value. */
  scenarioReliefRate: number;
}

export const SAMPLE_LINE: SampleLineInput = {
  description: 'Hot-rolled steel coil, line 14',
  supplier: SAMPLE_SUPPLIERS.meridian,
  customsValue: 31_800,
  quantityTonnes: 48,
  defaultIntensity: SCENARIO_ASSUMPTIONS.defaultIntensityIronSteel.value,
  actualIntensity: SUPPLIER_ACTUALS['Meridian Alloy Works'].iron_steel,
  scenarioRate: SCENARIO_ASSUMPTIONS.rate.value,
  scenarioReliefRate: SCENARIO_ASSUMPTIONS.relief.value,
};

export interface SampleLineResult {
  emissions: number;
  gross: number;
  relief: number;
  net: number;
}

export function computeSampleLine(
  input: SampleLineInput,
  basis: 'default' | 'actual',
): SampleLineResult {
  const intensity = basis === 'default' ? input.defaultIntensity : input.actualIntensity;
  const emissions = round(input.quantityTonnes * intensity);
  const gross = round(emissions * input.scenarioRate);
  const relief = round(emissions * input.scenarioReliefRate);
  return { emissions, gross, relief, net: round(gross - relief) };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Indicative difference between the default and the supplier actual basis for the sample line. */
export function sampleBasisDifference(input: SampleLineInput = SAMPLE_LINE): number {
  return round(computeSampleLine(input, 'default').net - computeSampleLine(input, 'actual').net);
}

export interface SampleLedgerRow {
  description: string;
  supplier: string;
  value: number;
  scope: 'in_scope' | 'out_of_scope' | 'before_start';
}

export const SAMPLE_LEDGER: readonly SampleLedgerRow[] = [
  {
    description: 'Hot-rolled steel coil',
    supplier: SAMPLE_SUPPLIERS.atlas,
    value: 18_400,
    scope: 'in_scope',
  },
  {
    description: 'Steel fasteners',
    supplier: SAMPLE_SUPPLIERS.atlas,
    value: 6_150,
    scope: 'in_scope',
  },
  {
    description: 'Aluminium scrap',
    supplier: SAMPLE_SUPPLIERS.northChannel,
    value: 4_900,
    scope: 'out_of_scope',
  },
  {
    description: 'Cement, bagged',
    supplier: SAMPLE_SUPPLIERS.northChannel,
    value: 3_700,
    scope: 'in_scope',
  },
];

export const SAMPLE_READINESS_ITEMS = [
  { label: 'Import ledger reconciled', done: true },
  { label: 'Scope reviewed by line', done: true },
  { label: 'Supplier emissions data', done: false },
  { label: 'Evidence stored with each line', done: false },
] as const;
