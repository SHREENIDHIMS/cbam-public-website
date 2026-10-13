import { afterEach, describe, expect, it, vi } from 'vitest';
import { analyticsEventSchemas } from '@/lib/analytics/events';
import { setAnalyticsProvider, track } from '@/lib/analytics';
import { noopProvider } from '@/lib/analytics/providers/noop';

describe('analytics events', () => {
  it('declares only closed value lists or booleans (no numbers, no free text)', () => {
    for (const [name, spec] of Object.entries(analyticsEventSchemas)) {
      for (const [field, rule] of Object.entries(spec as Record<string, unknown>)) {
        const closed = rule === 'boolean' || (Array.isArray(rule) && rule.length > 0);
        expect(closed, `${name}.${field}`).toBe(true);
      }
    }
  });

  afterEach(() => setAnalyticsProvider(noopProvider));

  it('forwards valid events to the provider', () => {
    const provider = { track: vi.fn() };
    setAnalyticsProvider(provider);
    expect(
      track({ name: 'cta_click', properties: { location: 'hero', cta: 'check_exposure' } }),
    ).toBe(true);
    expect(provider.track).toHaveBeenCalledOnce();
  });

  it('drops invalid or extra-field events', () => {
    const provider = { track: vi.fn() };
    setAnalyticsProvider(provider);
    const bad = { name: 'cta_click', properties: { location: 'a@b.test', cta: 'x' } };
    expect(track(bad as never)).toBe(false);
    expect(provider.track).not.toHaveBeenCalled();
    const extra = { name: 'wizard_start', properties: { email: 'a@b.test' } };
    expect(track(extra as never)).toBe(false);
    expect(provider.track).not.toHaveBeenCalled();
  });
});
