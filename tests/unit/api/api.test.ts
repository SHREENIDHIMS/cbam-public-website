import { describe, expect, it } from 'vitest';
import { getAdapter } from '@/lib/api/client';
import { ApiError, API_ERROR_CODES, USER_MESSAGES, toUserMessage } from '@/lib/api/errors';
import { fixtureAdapter } from '@/lib/api/fixture-adapter';
import { FIXTURE_FILE_HASHES } from '@/lib/api/fixtures/upload-manifest';
import { liveAdapter } from '@/lib/api/live-adapter';
import {
  publicProductConfigSchema,
  publicRulesSummarySchema,
  rateWatchSchema,
} from '@/lib/api/schemas';
import { ADAPTER_METHODS } from '@/lib/api/types';
import { rules } from '@/lib/config/rules';

describe('fixture adapter', () => {
  it('returns schema-valid, labelled fixture responses', async () => {
    const summary = await fixtureAdapter.getPublicRulesSummary();
    expect(publicRulesSummarySchema.parse(summary).dataSource).toBe('fixture');
    expect(summary.rulesVersion).toBe(rules.rulesVersion);
    // The headline values were checked against their primary pages (docs/PROGRESS.md).
    expect(summary.allUnverified).toBe(false);

    expect(
      publicProductConfigSchema.parse(await fixtureAdapter.getPublicProductConfig()).dataSource,
    ).toBe('fixture');
    expect(rateWatchSchema.parse(await fixtureAdapter.getRateWatch()).officialRate).toBeNull();
  });

  it('acknowledges a contact request in demo mode without storing anything', async () => {
    const ack = await fixtureAdapter.submitContactRequest({
      email: 'a@example.com',
      kind: 'general',
      marketingConsent: false,
    });
    expect(ack).toMatchObject({ dataSource: 'fixture', received: true });
  });

  it('serves the guide index and a guide from local content', async () => {
    const index = await fixtureAdapter.getGuideIndex();
    expect(index.dataSource).toBe('fixture');
    expect(index.guides.length).toBeGreaterThanOrEqual(5);
    const guide = await fixtureAdapter.getGuide('what-is-uk-cbam');
    expect(guide.guide.title).toMatch(/UK CBAM/);
    expect(guide.guide.body).toContain('## ');
    await expect(fixtureAdapter.getGuide('nope')).rejects.toMatchObject({ code: 'not_found' });
  });

  it('acknowledges a rate alert in demo mode without sending anything', async () => {
    const ack = await fixtureAdapter.subscribeRateAlert({
      email: 'a@example.com',
      consent: true,
      marketingConsent: false,
    });
    expect(ack).toMatchObject({ dataSource: 'fixture', received: true });
    expect(ack.message).toMatch(/Demo mode/);
    await expect(
      fixtureAdapter.subscribeRateAlert({
        email: 'not-an-email',
        consent: true,
        marketingConsent: false,
      }),
    ).rejects.toBeTruthy();
  });

  it('never uploads a raw file: that method stays unimplemented in fixture mode', async () => {
    await expect(
      fixtureAdapter.uploadLiabilityPreviewFile('fx_northstar', new Blob(['x'])),
    ).rejects.toMatchObject({ code: 'not_implemented_fixture' });
  });

  it('creates a preview for a sample file hash and a labelled demo for any other', async () => {
    const counts = {
      rowsFound: 1,
      included: 1,
      normalised: 0,
      needsReview: 0,
      duplicates: 0,
      rejected: 0,
      totalRowsExcluded: 0,
    };
    const row = {
      rowNumber: 2,
      importDate: '2027-01-12',
      commodityCode: '7208390000',
      description: null,
      originCountry: null,
      supplier: null,
      netMassKg: 1000,
      customsValueGbp: 100,
      entryReference: null,
      supplierDeclaration: null,
    };
    const known = await fixtureAdapter.createLiabilityPreview({
      fileSha256: Object.keys(FIXTURE_FILE_HASHES)[0]!,
      fileType: 'csv',
      sheetName: null,
      rows: [row],
      clientSummary: counts,
    });
    expect(known).toMatchObject({ sessionId: 'fx_northstar', isDemo: false, visitorCounts: null });
    const demo = await fixtureAdapter.createLiabilityPreview({
      fileSha256: 'a'.repeat(64),
      fileType: 'csv',
      sheetName: null,
      rows: [row],
      clientSummary: counts,
    });
    expect(demo).toMatchObject({ sessionId: 'fx_demo', isDemo: true, visitorCounts: counts });
    expect(demo.summary.netGbp).toBe(known.summary.netGbp);
  });

  it('reads a preview by session id and reports unknown ids as not_found', async () => {
    expect((await fixtureAdapter.getLiabilityPreview('fx_supplier_b')).fixtureKey).toBe(
      'supplier_b',
    );
    for (const id of ['fx_unknown', 'nope', '../etc', '']) {
      await expect(fixtureAdapter.getLiabilityPreview(id)).rejects.toMatchObject({
        code: 'not_found',
      });
    }
  });
});

describe('live adapter', () => {
  it('throws not_configured for every method and never falls back to fixtures', async () => {
    // Guides are local content and are served in live mode too.
    const local = ['getGuideIndex', 'getGuide'];
    for (const method of ADAPTER_METHODS.filter((name) => !local.includes(name))) {
      const call = liveAdapter[method] as () => Promise<unknown>;
      await expect(call()).rejects.toMatchObject({ code: 'not_configured', method });
    }
    expect((await liveAdapter.getGuideIndex()).dataSource).toBe('live');
  });
});

describe('getAdapter', () => {
  it('honours the mode', () => {
    expect(getAdapter('fixture')).toBe(fixtureAdapter);
    expect(getAdapter('live')).toBe(liveAdapter);
  });
});

describe('errors', () => {
  it('maps every code to specific, non-generic copy', () => {
    for (const code of API_ERROR_CODES) {
      const message = USER_MESSAGES[code];
      expect(message.length).toBeGreaterThan(30);
      expect(message).not.toMatch(/^something went wrong\.?$/i);
      expect(new ApiError(code).userMessage).toBe(message);
    }
  });

  it('gives useful copy for unknown errors', () => {
    expect(toUserMessage(new Error('boom'))).not.toMatch(/boom/);
  });
});
