import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import('@/lib/api/http');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const schema = z.object({ ok: z.literal(true) });
const base = { PUBLIC_API_MODE: 'live', CBAM_API_URL: 'https://backend.example.test' };

describe('liveRequest error mapping and timeouts', () => {
  it('throws not_configured when no backend URL is set', async () => {
    const { liveRequest } = await load({ PUBLIC_API_MODE: 'fixture', CBAM_API_URL: '' });
    await expect(liveRequest({ method: 'GET', path: '/x', schema })).rejects.toMatchObject({
      code: 'not_configured',
    });
  });

  it.each([
    [404, 'not_found'],
    [429, 'rate_limited'],
    [500, 'unavailable'],
    [503, 'unavailable'],
    [400, 'rejected'],
    [422, 'rejected'],
  ])('maps HTTP %i to %s', async (status, code) => {
    const { liveRequest } = await load(base);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    await expect(liveRequest({ method: 'GET', path: '/x', schema })).rejects.toMatchObject({
      code,
    });
  });

  it('maps a response that does not match the schema to invalid_response', async () => {
    const { liveRequest } = await load(base);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"ok":false}', { status: 200 })),
    );
    await expect(liveRequest({ method: 'GET', path: '/x', schema })).rejects.toMatchObject({
      code: 'invalid_response',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', { status: 200 })));
    await expect(liveRequest({ method: 'GET', path: '/x', schema })).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  it('maps a network failure to unavailable and a timeout to timeout', async () => {
    const { liveRequest } = await load(base);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(liveRequest({ method: 'GET', path: '/x', schema })).rejects.toMatchObject({
      code: 'unavailable',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('timed out', 'TimeoutError')),
    );
    await expect(liveRequest({ method: 'GET', path: '/x', schema })).rejects.toMatchObject({
      code: 'timeout',
    });
  });

  it('passes an abort signal so every call has a timeout', async () => {
    const { liveRequest } = await load({ ...base, CBAM_API_TIMEOUT_MS: '2000' });
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await liveRequest({ method: 'GET', path: '/x', schema });
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.cache).toBe('no-store');
  });
});
