import 'server-only';
import { rules } from '@/lib/config/rules';
import { ApiError } from './errors';
import { buildGuideMethods } from './guide-methods';
import { buildFixturePreview, fixtureKeyFromSessionId } from './fixtures/liability-previews';
import { FIXTURE_FILE_HASHES } from './fixtures/upload-manifest';
import { buildProductConfigFixture } from './fixtures/product-config';
import { buildQuickEstimateFixture } from './fixtures/quick-estimate';
import { buildThresholdFixture } from './fixtures/threshold';
import { buildRateWatchFixture } from './fixtures/rate-watch';
import { buildRulesSummaryFixture } from './fixtures/rules-summary';
import {
  acknowledgementSchema,
  contactRequestInputSchema,
  createLiabilityPreviewInputSchema,
  rateAlertInputSchema,
  liabilityPreviewSchema,
  previewSessionIdSchema,
  publicProductConfigSchema,
  publicRulesSummarySchema,
  quickEstimateInputSchema,
  quickEstimateResultSchema,
  rateWatchSchema,
  thresholdCheckInputSchema,
  thresholdCheckResultSchema,
} from './schemas';
import type { PublicApiAdapter } from './types';

const notImplemented = (method: string) => async (): Promise<never> => {
  throw new ApiError('not_implemented_fixture', method);
};

/** Fixture adapter. Every response is parsed with its schema so fixtures cannot drift. */
export const fixtureAdapter: PublicApiAdapter = {
  async getPublicRulesSummary() {
    return publicRulesSummarySchema.parse(buildRulesSummaryFixture());
  },
  async getPublicProductConfig() {
    return publicProductConfigSchema.parse(buildProductConfigFixture());
  },
  async getRateWatch() {
    return rateWatchSchema.parse(buildRateWatchFixture());
  },
  async runQuickEstimate(input) {
    return quickEstimateResultSchema.parse(
      buildQuickEstimateFixture(quickEstimateInputSchema.parse(input)),
    );
  },
  async runThresholdCheck(input) {
    return thresholdCheckResultSchema.parse(
      buildThresholdFixture(thresholdCheckInputSchema.parse(input)),
    );
  },
  async createLiabilityPreview(input) {
    const parsed = createLiabilityPreviewInputSchema.parse(input);
    // Known sample files map to their pre-computed result. Anything else is a labelled demo.
    const key = FIXTURE_FILE_HASHES[parsed.fileSha256] ?? 'demo';
    return liabilityPreviewSchema.parse(
      buildFixturePreview(key, key === 'demo' ? parsed.clientSummary : null),
    );
  },
  // The raw file never leaves the browser, so there is nothing to upload (DECISIONS 22).
  uploadLiabilityPreviewFile: notImplemented('uploadLiabilityPreviewFile'),
  async getLiabilityPreview(sessionId) {
    const key = previewSessionIdSchema.safeParse(sessionId).success
      ? fixtureKeyFromSessionId(sessionId)
      : null;
    if (!key) throw new ApiError('not_found', 'getLiabilityPreview');
    return liabilityPreviewSchema.parse(buildFixturePreview(key, null));
  },
  ...buildGuideMethods('fixture'),
  /** Validates and acknowledges. Fixture mode never sends email and never keeps the address. */
  async subscribeRateAlert(input) {
    rateAlertInputSchema.parse(input);
    return acknowledgementSchema.parse({
      rulesVersion: rules.rulesVersion,
      dataSource: 'fixture',
      received: true,
      message: 'Demo mode: no email was sent and your address was not stored.',
    });
  },
  // Validates and acknowledges. Nothing is stored, emailed or logged in fixture mode.
  async submitContactRequest(input) {
    contactRequestInputSchema.parse(input);
    return acknowledgementSchema.parse({
      rulesVersion: rules.rulesVersion,
      dataSource: 'fixture',
      received: true,
      message: 'Demo mode: no email was sent and your details were not stored.',
    });
  },
};
