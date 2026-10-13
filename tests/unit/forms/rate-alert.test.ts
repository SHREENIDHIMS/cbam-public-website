// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetRateLimits } from '@/lib/security/rate-limit';
import {
  fieldErrorsFrom,
  rateAlertFormSchema,
  readRateAlertFormData,
} from '@/lib/validation/forms';

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9' }),
}));

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe('rate alert form schema', () => {
  it('requires a valid email and the alerts tick box, and defaults marketing to off', () => {
    const empty = rateAlertFormSchema.safeParse(readRateAlertFormData(form({})));
    expect(empty.success).toBe(false);
    if (!empty.success) {
      const errors = fieldErrorsFrom(empty.error);
      expect(errors.email).toMatch(/Enter your email/);
      expect(errors.alertsConsent).toMatch(/Tick the box/);
    }
    const bad = rateAlertFormSchema.safeParse(
      readRateAlertFormData(form({ email: 'nope', alertsConsent: 'on' })),
    );
    expect(bad.success).toBe(false);
    const ok = rateAlertFormSchema.safeParse(
      readRateAlertFormData(form({ email: ' a@example.com ', alertsConsent: 'on' })),
    );
    expect(ok.success && ok.data).toEqual({
      email: 'a@example.com',
      alertsConsent: true,
      marketingConsent: false,
    });
  });

  it('keeps marketing consent separate from the alerts consent', () => {
    const only = readRateAlertFormData(form({ email: 'a@example.com', marketingConsent: 'on' }));
    expect(only.alertsConsent).toBe(false);
    expect(only.marketingConsent).toBe(true);
  });
});

describe('submitRateAlert', () => {
  beforeEach(() => resetRateLimits());

  it('acknowledges a valid request in demo mode', async () => {
    const { submitRateAlert } = await import('@/lib/forms/submit');
    const state = await submitRateAlert(form({ email: 'a@example.com', alertsConsent: 'on' }));
    expect(state).toMatchObject({ status: 'success', demo: true });
    expect(state.message).toMatch(/Demo mode/);
  });

  it('returns field errors and keeps the email for the form', async () => {
    const { submitRateAlert } = await import('@/lib/forms/submit');
    const state = await submitRateAlert(form({ email: 'a@example.com' }));
    expect(state.status).toBe('error');
    expect(state.fieldErrors?.alertsConsent).toBeTruthy();
    expect(state.values?.email).toBe('a@example.com');
  });

  it('shows a bot the normal success state and does nothing', async () => {
    const { submitRateAlert } = await import('@/lib/forms/submit');
    const state = await submitRateAlert(
      form({ email: 'a@example.com', alertsConsent: 'on', website: 'http://spam.example' }),
    );
    expect(state.status).toBe('success');
    expect(state.demo).toBeUndefined();
  });

  it('rate limits repeated submissions from one address', async () => {
    const { submitRateAlert } = await import('@/lib/forms/submit');
    const data = () => form({ email: 'a@example.com', alertsConsent: 'on' });
    const results = [];
    for (let i = 0; i < 6; i += 1) results.push(await submitRateAlert(data()));
    expect(results.slice(0, 5).every((r) => r.status === 'success')).toBe(true);
    expect(results[5]?.status).toBe('error');
    expect(results[5]?.message).toMatch(/several requests/);
  });
});
