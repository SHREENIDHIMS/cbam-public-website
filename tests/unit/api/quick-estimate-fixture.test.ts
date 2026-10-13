import { describe, expect, it } from 'vitest';
import { fixtureAdapter } from '@/lib/api/fixture-adapter';
import {
  quickEstimateResultSchema,
  thresholdCheckResultSchema,
  type QuickEstimateInput,
} from '@/lib/api/schemas';
import { rules } from '@/lib/config/rules';

const base: QuickEstimateInput = {
  value: 'under_25k',
  sectors: ['iron_steel'],
  origins: ['china'],
  suppliers: '2_5',
  large: 'no',
};

const run = (patch: Partial<QuickEstimateInput>) =>
  fixtureAdapter.runQuickEstimate({ ...base, ...patch });

describe('quick estimate fixture', () => {
  it.each([
    ['under_25k', 'no', 'below'],
    ['under_25k', 'yes', 'approaching'],
    ['25k_50k', 'no', 'approaching'],
    ['25k_50k', 'yes', 'approaching'],
    ['50k_100k', 'no', 'likely_triggered'],
    ['over_2m', 'yes', 'likely_triggered'],
    ['unknown', 'no', 'needs_data'],
  ] as const)('%s with large=%s gives %s', async (value, large, status) => {
    const result = await run({ value, large });
    expect(quickEstimateResultSchema.parse(result).status).toBe(status);
    expect(result.dataSource).toBe('fixture');
  });

  it('takes provenance from the rules and never reports high confidence', async () => {
    const result = await run({});
    expect(result.threshold.provenance).toBe(rules.registrationThreshold.status);
    expect(result.confidence.level).toBe('medium');
  });

  it('drops to low confidence when the visitor is unsure', async () => {
    expect((await run({ sectors: ['unsure'] })).confidence.level).toBe('low');
    expect((await run({ suppliers: 'unknown' })).confidence.level).toBe('low');
    expect((await run({ large: 'unsure' })).confidence.level).toBe('low');
  });

  it('names a main sector only when one is selected', async () => {
    expect((await run({})).sectorExposure.main).toBe('iron_steel');
    expect((await run({ sectors: ['iron_steel', 'cement'] })).sectorExposure.main).toBeNull();
  });
});

describe('threshold fixture', () => {
  it('builds both views with explanations', async () => {
    const result = await fixtureAdapter.runThresholdCheck({
      sectors: ['none'],
      annualValue: 45000,
      lumpy: false,
      nextThirtyDays: 60000,
    });
    thresholdCheckResultSchema.parse(result);
    expect(result.backward.status).toBe('approaching');
    expect(result.forward.status).toBe('triggered');
    expect(result.nextStep).toMatch(/may not apply/);
  });
});
