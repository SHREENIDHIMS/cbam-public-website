import { describe, expect, it } from 'vitest';
import {
  parseQuickEstimateSearchParams,
  step2Schema,
  toSearchParams,
} from '@/lib/validation/quick-estimate';

describe('quick estimate search params', () => {
  it('round-trips answers', () => {
    const answers = {
      value: '25k_50k',
      sectors: ['iron_steel', 'cement'],
      origins: ['china', 'india'],
      suppliers: '2_5',
      large: 'no',
    } as const;
    const query = toSearchParams({
      ...answers,
      sectors: [...answers.sectors],
      origins: [...answers.origins],
    });
    const parsed = parseQuickEstimateSearchParams(Object.fromEntries(new URLSearchParams(query)));
    expect(parsed).toMatchObject({ success: true, data: { value: '25k_50k' } });
    expect(parsed.success && parsed.data.sectors).toEqual(['iron_steel', 'cement']);
  });

  it('rejects a missing version, unknown keys and mixed unsure', () => {
    const ok = {
      v: '1',
      value: 'under_25k',
      sectors: 'cement',
      origins: 'china',
      suppliers: '1',
      large: 'no',
    };
    expect(parseQuickEstimateSearchParams(ok).success).toBe(true);
    expect(parseQuickEstimateSearchParams({ ...ok, v: undefined }).success).toBe(false);
    expect(parseQuickEstimateSearchParams({ ...ok, value: 'huge' }).success).toBe(false);
    expect(parseQuickEstimateSearchParams({ ...ok, sectors: 'cement,unsure' }).success).toBe(false);
    expect(parseQuickEstimateSearchParams({ ...ok, origins: '' }).success).toBe(false);
  });

  it('requires a sector choice', () => {
    expect(step2Schema.safeParse({ sectors: [] }).success).toBe(false);
  });
});
