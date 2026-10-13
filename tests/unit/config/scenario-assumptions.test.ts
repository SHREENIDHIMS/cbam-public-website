import { describe, expect, it } from 'vitest';
import { SCENARIO_ASSUMPTIONS, scenarioAssumptionSchema } from '@/lib/config/scenario-assumptions';

describe('scenario assumptions', () => {
  it('are all scenario provenance', () => {
    for (const entry of Object.values(SCENARIO_ASSUMPTIONS)) {
      expect(scenarioAssumptionSchema.parse(entry).provenance).toBe('scenario');
    }
  });
});
