import type {
  Acknowledgement,
  ContactRequestInput,
  CreateLiabilityPreviewInput,
  Guide,
  GuideIndex,
  LiabilityPreview,
  PublicProductConfig,
  PublicRulesSummary,
  QuickEstimateInput,
  QuickEstimateResult,
  RateAlertInput,
  RateWatch,
  ThresholdCheckInput,
  ThresholdCheckResult,
} from './schemas';

/** The public API adapter contract (MASTER_PROMPT 23). Method names match INTEGRATION_CONTRACT. */
export interface PublicApiAdapter {
  getPublicRulesSummary(): Promise<PublicRulesSummary>;
  runQuickEstimate(input: QuickEstimateInput): Promise<QuickEstimateResult>;
  runThresholdCheck(input: ThresholdCheckInput): Promise<ThresholdCheckResult>;
  createLiabilityPreview(input: CreateLiabilityPreviewInput): Promise<LiabilityPreview>;
  uploadLiabilityPreviewFile(sessionId: string, file: Blob): Promise<LiabilityPreview>;
  getLiabilityPreview(sessionId: string): Promise<LiabilityPreview>;
  getGuideIndex(): Promise<GuideIndex>;
  getGuide(slug: string): Promise<Guide>;
  getRateWatch(): Promise<RateWatch>;
  subscribeRateAlert(input: RateAlertInput): Promise<Acknowledgement>;
  submitContactRequest(input: ContactRequestInput): Promise<Acknowledgement>;
  getPublicProductConfig(): Promise<PublicProductConfig>;
}

export const ADAPTER_METHODS = [
  'getPublicRulesSummary',
  'runQuickEstimate',
  'runThresholdCheck',
  'createLiabilityPreview',
  'uploadLiabilityPreviewFile',
  'getLiabilityPreview',
  'getGuideIndex',
  'getGuide',
  'getRateWatch',
  'subscribeRateAlert',
  'submitContactRequest',
  'getPublicProductConfig',
] as const satisfies ReadonlyArray<keyof PublicApiAdapter>;
