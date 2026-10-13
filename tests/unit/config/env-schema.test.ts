import { describe, expect, it } from 'vitest';
import { parsePublicEnv, parseServerEnv } from '@/lib/config/env-schema';

describe('server env schema', () => {
  it('accepts fixture defaults from an empty environment', () => {
    const env = parseServerEnv({});
    expect(env.PUBLIC_API_MODE).toBe('fixture');
    expect(env.CBAM_API_TIMEOUT_MS).toBe(10000);
    expect(env.RATE_LIMIT_DISABLED).toBe(false);
  });

  it('treats empty strings as unset', () => {
    const env = parseServerEnv({ CBAM_API_URL: '', CBAM_API_KEY: '', CBAM_API_TIMEOUT_MS: '' });
    expect(env.CBAM_API_URL).toBeUndefined();
    expect(env.CBAM_API_TIMEOUT_MS).toBe(10000);
  });

  it('fails live mode without CBAM_API_URL', () => {
    expect(() => parseServerEnv({ PUBLIC_API_MODE: 'live' })).toThrow(/CBAM_API_URL/);
  });

  it('accepts live mode with an API URL', () => {
    const env = parseServerEnv({
      PUBLIC_API_MODE: 'live',
      CBAM_API_URL: 'https://api.example.test',
    });
    expect(env.PUBLIC_API_MODE).toBe('live');
  });

  it('requires https for the live API in production', () => {
    expect(() =>
      parseServerEnv({
        PUBLIC_API_MODE: 'live',
        CBAM_API_URL: 'http://api.example.test',
        NEXT_PUBLIC_SITE_ENV: 'production',
      }),
    ).toThrow(/https/);
  });

  it('rejects an unknown mode and an out-of-range timeout', () => {
    expect(() => parseServerEnv({ PUBLIC_API_MODE: 'demo' })).toThrow();
    expect(() => parseServerEnv({ CBAM_API_TIMEOUT_MS: '500' })).toThrow();
    expect(() => parseServerEnv({ CBAM_API_TIMEOUT_MS: '99999' })).toThrow();
  });
});

describe('public env schema', () => {
  it('accepts development defaults', () => {
    const env = parsePublicEnv({});
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(env.NEXT_PUBLIC_SITE_ENV).toBe('development');
    expect(env.NEXT_PUBLIC_CBAM_SIGN_IN_PATH).toBe('/');
    expect(env.NEXT_PUBLIC_CBAM_APP_URL).toBeUndefined();
  });

  it('requires the app URL in production', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_ENV: 'production' })).toThrow(
      /NEXT_PUBLIC_CBAM_APP_URL/,
    );
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SITE_ENV: 'production',
        NEXT_PUBLIC_CBAM_APP_URL: 'https://app.example.test',
      }).NEXT_PUBLIC_CBAM_APP_URL,
    ).toBe('https://app.example.test');
  });

  it('rejects hand-off paths that are not paths', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_CBAM_SIGN_IN_PATH: 'sign-in' })).toThrow();
  });
});
