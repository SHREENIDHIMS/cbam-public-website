import { beforeEach, describe, expect, it } from 'vitest';
import { getClientIp } from '@/lib/security/client-ip';
import { checkRateLimit, resetRateLimits } from '@/lib/security/rate-limit';
import { isSameOrigin } from '@/lib/security/same-origin';

const headers = (values: Record<string, string>) => new Headers(values);

describe('rate limit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to max then blocks until the window resets', () => {
    const options = { max: 2, windowMs: 1000, now: 0 };
    expect(checkRateLimit('1.1.1.1', '/r', options).allowed).toBe(true);
    expect(checkRateLimit('1.1.1.1', '/r', options).allowed).toBe(true);
    const blocked = checkRateLimit('1.1.1.1', '/r', options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    expect(checkRateLimit('1.1.1.1', '/r', { ...options, now: 1001 }).allowed).toBe(true);
  });

  it('keys by ip and route', () => {
    const options = { max: 1, windowMs: 1000, now: 0 };
    expect(checkRateLimit('1.1.1.1', '/a', options).allowed).toBe(true);
    expect(checkRateLimit('1.1.1.1', '/b', options).allowed).toBe(true);
    expect(checkRateLimit('2.2.2.2', '/a', options).allowed).toBe(true);
    expect(checkRateLimit('1.1.1.1', '/a', options).allowed).toBe(false);
  });

  it('can be disabled', () => {
    const options = { max: 1, windowMs: 1000, now: 0, disabled: true };
    for (let i = 0; i < 5; i += 1) expect(checkRateLimit('x', '/r', options).allowed).toBe(true);
  });
});

describe('client ip', () => {
  it('uses the first forwarded hop, then x-real-ip, then unknown', () => {
    expect(getClientIp(headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }))).toBe('9.9.9.9');
    expect(getClientIp(headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8');
    expect(getClientIp(headers({}))).toBe('unknown');
  });
});

describe('same origin', () => {
  const site = 'https://site.example.test';

  it('accepts a missing origin and a matching origin', () => {
    expect(isSameOrigin(headers({}), site)).toBe(true);
    expect(isSameOrigin(headers({ origin: site }), site)).toBe(true);
  });

  it('accepts the request host', () => {
    expect(
      isSameOrigin(headers({ origin: 'http://localhost:3100', host: 'localhost:3100' }), site),
    ).toBe(true);
  });

  it('rejects other origins and malformed origins', () => {
    expect(
      isSameOrigin(headers({ origin: 'https://evil.test', host: 'site.example.test' }), site),
    ).toBe(false);
    expect(isSameOrigin(headers({ origin: 'not a url' }), site)).toBe(false);
  });
});
