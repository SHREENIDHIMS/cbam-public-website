import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getPreview } from '@/app/api/liability-preview/[sessionId]/route';
import { POST } from '@/app/api/liability-preview/route';
import { FIXTURE_FILE_HASHES } from '@/lib/api/fixtures/upload-manifest';
import { apiErrorBodySchema, liabilityPreviewSchema } from '@/lib/api/schemas';
import { statusForApiError } from '@/lib/api/route-helpers';
import { API_ERROR_CODES } from '@/lib/api/errors';
import { toolsConfig } from '@/lib/config/tools';
import { resetRateLimits } from '@/lib/security/rate-limit';

const URL_ = 'http://localhost:3000/api/liability-preview';
const SECRET_SUPPLIER = 'Zebra Confidential Supplier';

const row = {
  rowNumber: 2,
  importDate: '2027-01-12',
  commodityCode: '7208390000',
  description: null,
  originCountry: 'TR',
  supplier: SECRET_SUPPLIER,
  netMassKg: 48000,
  customsValueGbp: 31800,
  entryReference: null,
  supplierDeclaration: 'verified',
};
const body = {
  fileSha256: Object.keys(FIXTURE_FILE_HASHES)[0],
  fileType: 'csv',
  sheetName: null,
  rows: [row],
  clientSummary: {
    rowsFound: 1,
    included: 1,
    normalised: 0,
    needsReview: 0,
    duplicates: 0,
    rejected: 0,
    totalRowsExcluded: 0,
  },
};

const post = (payload: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request(URL_, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    }),
  );

async function errorOf(response: Response) {
  return apiErrorBodySchema.parse(await response.json()).error;
}

describe('POST /api/liability-preview', () => {
  const spies: ReturnType<typeof vi.spyOn>[] = [];
  beforeEach(() => {
    resetRateLimits();
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      spies.push(vi.spyOn(console, method).mockImplementation(() => {}));
    }
  });
  afterEach(() => {
    spies.forEach((spy) => spy.mockRestore());
    spies.length = 0;
  });

  it('returns a schema-valid preview with no-store caching', async () => {
    const response = await post(body);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const result = liabilityPreviewSchema.parse(await response.json());
    expect(result.sessionId).toBe('fx_northstar');
  });

  it('rejects a cross-origin request', async () => {
    const response = await post(body, { origin: 'https://evil.example' });
    expect(response.status).toBe(403);
    expect((await errorOf(response)).code).toBe('rejected');
  });

  it('rejects an oversized body by declared length and by actual length', async () => {
    const declared = await post(body, {
      'content-length': String(toolsConfig.upload.maxJsonBodyBytes + 1),
    });
    expect(declared.status).toBe(413);
    const big = await post(
      JSON.stringify({ pad: 'x'.repeat(toolsConfig.upload.maxJsonBodyBytes) }),
    );
    expect(big.status).toBe(413);
  });

  it('rejects malformed JSON and bodies that fail the schema', async () => {
    expect((await post('{not json')).status).toBe(400);
    expect((await post({ ...body, rows: [] })).status).toBe(400);
    expect((await post({ ...body, fileSha256: 'abc' })).status).toBe(400);
    expect((await post({ ...body, rows: [{ ...row, importDate: 'tomorrow' }] })).status).toBe(400);
  });

  it('rate limits with a Retry-After header', async () => {
    const { max } = toolsConfig.rateLimits.liabilityPreview;
    for (let i = 0; i < max; i += 1) {
      expect((await post(body, { 'x-forwarded-for': '9.9.9.9' })).status).toBe(200);
    }
    const blocked = await post(body, { 'x-forwarded-for': '9.9.9.9' });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await errorOf(blocked)).code).toBe('rate_limited');
    // Another address is unaffected.
    expect((await post(body, { 'x-forwarded-for': '8.8.8.8' })).status).toBe(200);
  });

  it('never writes request content to the console', async () => {
    await post(body);
    await post('{not json');
    await post({ ...body, rows: [{ ...row, importDate: 'tomorrow' }] });
    const logged = spies.flatMap((spy) => spy.mock.calls.flat().map(String)).join('\n');
    expect(logged).not.toContain(SECRET_SUPPLIER);
    expect(logged).not.toContain('7208390000');
  });

  it('maps every error code to a status', () => {
    for (const code of API_ERROR_CODES) expect(statusForApiError(code)).toBeGreaterThanOrEqual(400);
    expect(statusForApiError('rate_limited')).toBe(429);
    expect(statusForApiError('timeout')).toBe(504);
  });
});

describe('GET /api/liability-preview/[sessionId]', () => {
  beforeEach(() => resetRateLimits());
  const get = (id: string) =>
    getPreview(new Request(`${URL_}/${id}`), { params: Promise.resolve({ sessionId: id }) });

  it('returns a sample result and 404s unknown or malformed ids', async () => {
    const ok = await get('fx_meridian');
    expect(ok.status).toBe(200);
    expect(liabilityPreviewSchema.parse(await ok.json()).fixtureKey).toBe('meridian');
    for (const id of ['fx_unknown', 'bad id!', 'a'.repeat(200)]) {
      const response = await get(id);
      expect(response.status).toBe(404);
      expect((await errorOf(response)).code).toBe('not_found');
    }
  });
});
