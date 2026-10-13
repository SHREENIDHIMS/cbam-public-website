import { describe, expect, it } from 'vitest';
import { contactRequestInputSchema } from '@/lib/api/schemas';
import { fixtureAdapter } from '@/lib/api/fixture-adapter';
import { parseContactForm } from '@/lib/validation/contact';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe('contact form schema', () => {
  it('accepts a minimal valid request and treats marketing consent as off', () => {
    const result = parseContactForm(form({ name: 'Ada Example', email: 'ada@example.co.uk' }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingConsent).toBe(false);
      expect(result.data.company).toBeUndefined();
    }
  });

  it('records marketing consent only when the box is ticked', () => {
    const result = parseContactForm(
      form({ name: 'Ada', email: 'ada@example.co.uk', marketingConsent: 'on' }),
    );
    expect(result.success && result.data.marketingConsent).toBe(true);
  });

  it('reports a message per field', () => {
    const result = parseContactForm(form({ name: ' ', email: 'not-an-email' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBe('Enter your name.');
      expect(result.errors.email).toMatch(/valid email/);
    }
  });

  it('limits the message length', () => {
    const result = parseContactForm(
      form({ name: 'Ada', email: 'ada@example.co.uk', message: 'x'.repeat(1001) }),
    );
    expect(result.success).toBe(false);
  });

  it('feeds the adapter schema', () => {
    const parsed = parseContactForm(form({ name: 'Ada', email: 'ada@example.co.uk' }));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(contactRequestInputSchema.safeParse({ kind: 'broker', ...parsed.data }).success).toBe(
        true,
      );
    }
  });
});

describe('fixture submitContactRequest', () => {
  it('acknowledges in demo mode without claiming an email was sent', async () => {
    const ack = await fixtureAdapter.submitContactRequest({
      kind: 'broker',
      email: 'ada@example.co.uk',
      name: 'Ada',
      marketingConsent: false,
    });
    expect(ack.received).toBe(true);
    expect(ack.dataSource).toBe('fixture');
    expect(ack.message).toMatch(/no email was sent/i);
  });

  it('rejects an invalid email', async () => {
    await expect(
      fixtureAdapter.submitContactRequest({
        kind: 'general',
        email: 'nope',
        marketingConsent: false,
      }),
    ).rejects.toBeDefined();
  });
});
