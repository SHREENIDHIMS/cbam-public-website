import { beforeEach, describe, expect, it, vi } from 'vitest';

const submit = vi.fn();
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9' }),
}));
vi.mock('@/lib/api/client', () => ({
  getAdapter: () => ({ submitContactRequest: submit }),
}));

import { submitBrokerContact } from '@/app/(marketing)/for-brokers/actions';
import { ApiError } from '@/lib/api/errors';
import { INITIAL_CONTACT_STATE } from '@/lib/forms/contact-state';
import { toolsConfig } from '@/lib/config/tools';
import { resetRateLimits } from '@/lib/security/rate-limit';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = { name: 'Ada Example', email: 'ada@example.co.uk' };

beforeEach(() => {
  submit.mockReset();
  submit.mockResolvedValue({ received: true, dataSource: 'fixture', message: 'ok' });
  resetRateLimits();
});

describe('submitBrokerContact', () => {
  it('sends a valid request to the adapter as a broker request', async () => {
    const state = await submitBrokerContact(INITIAL_CONTACT_STATE, form(valid));
    expect(state).toEqual({ status: 'success', demo: true });
    expect(submit).toHaveBeenCalledWith({
      kind: 'broker',
      name: 'Ada Example',
      email: 'ada@example.co.uk',
      marketingConsent: false,
    });
  });

  it('validates on the server and keeps what was typed', async () => {
    const state = await submitBrokerContact(
      INITIAL_CONTACT_STATE,
      form({ name: 'Ada', email: 'broken' }),
    );
    expect(state.status).toBe('error');
    if (state.status === 'error') {
      expect(state.fieldErrors.email).toBeDefined();
      expect(state.values.name).toBe('Ada');
    }
    expect(submit).not.toHaveBeenCalled();
  });

  it('ignores a filled honeypot but looks like success', async () => {
    const state = await submitBrokerContact(
      INITIAL_CONTACT_STATE,
      form({ ...valid, website: 'https://spam.example' }),
    );
    expect(state.status).toBe('success');
    expect(submit).not.toHaveBeenCalled();
  });

  it('rate limits repeated requests', async () => {
    const { max } = toolsConfig.rateLimits.forms;
    for (let i = 0; i < max; i += 1) {
      await submitBrokerContact(INITIAL_CONTACT_STATE, form(valid));
    }
    const state = await submitBrokerContact(INITIAL_CONTACT_STATE, form(valid));
    expect(state.status).toBe('error');
    if (state.status === 'error') expect(state.message).toMatch(/several requests/);
    expect(submit).toHaveBeenCalledTimes(max);
  });

  it('reports an unavailable service without echoing the request', async () => {
    submit.mockRejectedValue(new ApiError('not_configured', 'submitContactRequest'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const state = await submitBrokerContact(INITIAL_CONTACT_STATE, form(valid));
    expect(state.status).toBe('error');
    if (state.status === 'error') expect(state.message).toMatch(/nothing has been sent/);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('ada@example.co.uk');
    errorSpy.mockRestore();
  });
});
