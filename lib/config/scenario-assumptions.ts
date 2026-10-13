import { z } from 'zod';

/**
 * Illustrative figures used by fixtures and the homepage samples.
 *
 * Every entry is a scenario assumption invented for the demo. None is a published rate,
 * default value or relief figure, and each one is shown with the Scenario badge.
 * Kept apart from rules.ts so no scenario value can be mistaken for a regulatory one.
 */

export const scenarioAssumptionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.number().nonnegative(),
  unit: z.string().min(1),
  provenance: z.literal('scenario'),
  note: z.string().min(1),
});
export type ScenarioAssumption = z.infer<typeof scenarioAssumptionSchema>;

const INVENTED = 'Invented for this demo. Not a published default value.';

export const SCENARIO_ASSUMPTIONS = {
  rate: {
    key: 'rate',
    label: 'Scenario carbon rate',
    value: 50,
    unit: '£ per tCO2e',
    provenance: 'scenario',
    note: 'An illustrative rate. It is not an official rate.',
  },
  relief: {
    key: 'relief',
    label: 'Scenario relief',
    value: 8,
    unit: '£ per tCO2e',
    provenance: 'scenario',
    note: 'Assumes a carbon price paid at origin and evidenced by a supplier declaration. Illustrative only.',
  },
  defaultIntensityIronSteel: {
    key: 'defaultIntensity.iron_steel',
    label: 'Scenario default intensity, iron and steel',
    value: 2.1,
    unit: 'tCO2e per tonne',
    provenance: 'scenario',
    note: INVENTED,
  },
  defaultIntensityAluminium: {
    key: 'defaultIntensity.aluminium',
    label: 'Scenario default intensity, aluminium',
    value: 7.5,
    unit: 'tCO2e per tonne',
    provenance: 'scenario',
    note: INVENTED,
  },
  defaultIntensityCement: {
    key: 'defaultIntensity.cement',
    label: 'Scenario default intensity, cement',
    value: 0.8,
    unit: 'tCO2e per tonne',
    provenance: 'scenario',
    note: INVENTED,
  },
} as const satisfies Record<string, ScenarioAssumption>;

/** Fictional supplier declarations (tCO2e per tonne) for the sample importers. */
export const SUPPLIER_ACTUALS = {
  'Meridian Alloy Works': { iron_steel: 1.78 },
  'Atlas Metals': { iron_steel: 1.92 },
} as const satisfies Record<string, Partial<Record<string, number>>>;

export const SUPPLIER_ACTUAL_NOTE = 'Fictional sample declaration.';
