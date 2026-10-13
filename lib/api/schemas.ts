import { z } from 'zod';
import '@/lib/validation/zod-browser';
import { API_ERROR_CODES } from './errors';
import {
  LIABILITY_PREVIEW_STATUSES,
  QUICK_ESTIMATE_STATUSES,
  THRESHOLD_STATUSES,
} from '@/lib/config/status';
import { SECTOR_KEYS } from '@/lib/config/rules-schema';
import { GUIDE_TOPICS } from '@/lib/content/guide-schema';
import { PROVENANCE_KEYS } from '@/lib/config/provenance';
import {
  LARGE_SHIPMENT_KEYS,
  NEXT_ACTION_KEYS,
  ORIGIN_GROUP_KEYS,
  SUPPLIER_BAND_KEYS,
  VALUE_BAND_KEYS,
} from '@/lib/config/tools';

/** Zod schemas for every adapter request and response. Shared by both adapters and the client. */

export const dataSourceSchema = z.enum(['fixture', 'live']);
export type DataSource = z.infer<typeof dataSourceSchema>;

const resultMeta = {
  rulesVersion: z.string().min(1),
  dataSource: dataSourceSchema,
};

const sectorKey = z.enum(SECTOR_KEYS);

export const publicRulesSummarySchema = z.object({
  ...resultMeta,
  reviewedAt: z.iso.date(),
  startDate: z.iso.date().nullable(),
  thresholdAmount: z.number().nullable(),
  sectors: z.array(z.object({ key: sectorKey, label: z.string() })),
  allUnverified: z.boolean(),
});
export type PublicRulesSummary = z.infer<typeof publicRulesSummarySchema>;

export const publicProductConfigSchema = z.object({
  ...resultMeta,
  brandName: z.string(),
  uploadLimits: z.object({
    maxFileBytes: z.number(),
    maxDataRows: z.number(),
    extensions: z.array(z.string()),
  }),
  features: z.object({ previewClaim: z.boolean() }),
});
export type PublicProductConfig = z.infer<typeof publicProductConfigSchema>;

export const rateWatchSchema = z.object({
  ...resultMeta,
  officialRate: z.number().nullable(),
  scenarios: z.array(
    z.object({ key: z.string(), label: z.string(), ratePerTonne: z.number(), note: z.string() }),
  ),
  events: z.array(z.object({ date: z.iso.date(), summary: z.string() })),
});
export type RateWatch = z.infer<typeof rateWatchSchema>;

const gbp = z.number().finite().nonnegative();
const provenanceKey = z.enum(PROVENANCE_KEYS);
const thresholdStatus = z.enum(THRESHOLD_STATUSES);
const quickEstimateStatus = z.enum(QUICK_ESTIMATE_STATUSES);
const isoDate = z.iso.date();

export const quickEstimateInputSchema = z.object({
  value: z.enum(VALUE_BAND_KEYS),
  sectors: z.array(z.union([sectorKey, z.literal('unsure')])).min(1),
  origins: z.array(z.enum(ORIGIN_GROUP_KEYS)).min(1),
  suppliers: z.enum(SUPPLIER_BAND_KEYS),
  large: z.enum(LARGE_SHIPMENT_KEYS),
});
export type QuickEstimateInput = z.infer<typeof quickEstimateInputSchema>;

export const quickEstimateResultSchema = z.object({
  ...resultMeta,
  status: quickEstimateStatus,
  valueRange: z.object({ low: gbp.nullable(), high: gbp.nullable() }),
  threshold: z.object({ amount: gbp.nullable(), provenance: provenanceKey }),
  sectorExposure: z.object({
    selected: z.array(sectorKey),
    main: sectorKey.nullable(),
    unsure: z.boolean(),
  }),
  reasons: z.array(z.string()).min(1),
  confidence: z.object({ level: z.enum(['low', 'medium']), reasons: z.array(z.string()) }),
  nextActions: z.array(z.object({ key: z.enum(NEXT_ACTION_KEYS), label: z.string() })),
});
export type QuickEstimateResult = z.infer<typeof quickEstimateResultSchema>;

export const thresholdCheckInputSchema = z.object({
  sectors: z.array(z.union([sectorKey, z.enum(['unsure', 'none'])])).min(1),
  annualValue: gbp,
  lumpy: z.boolean(),
  nextThirtyDays: gbp.nullable(),
});
export type ThresholdCheckInput = z.infer<typeof thresholdCheckInputSchema>;

const thresholdView = z.object({
  amount: gbp.nullable(),
  ratio: z.number().nonnegative().nullable(),
  status: thresholdStatus.nullable(),
  basis: z.enum(['entered', 'even_spread', 'not_assessed']),
  explanation: z.string(),
});

export const thresholdCheckResultSchema = z.object({
  ...resultMeta,
  thresholdAmount: gbp.nullable(),
  thresholdProvenance: provenanceKey,
  guidance: z.object({
    watchFrom: z.number(),
    approachingFrom: z.number(),
    label: z.string(),
  }),
  backward: thresholdView,
  forward: thresholdView,
  nextStep: z.string(),
});
export type ThresholdCheckResult = z.infer<typeof thresholdCheckResultSchema>;

export const FIXTURE_KEYS = [
  'northstar',
  'meridian',
  'supplier_b',
  'broker_export',
  'demo',
] as const;
export type FixtureKey = (typeof FIXTURE_KEYS)[number];

/** Fixture session ids look like `fx_northstar`. Live ids are validated by shape only. */
export const previewSessionIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,80}$/);

export const clientSummarySchema = z.object({
  rowsFound: z.number().int().nonnegative(),
  included: z.number().int().nonnegative(),
  normalised: z.number().int().nonnegative(),
  needsReview: z.number().int().nonnegative(),
  duplicates: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
  totalRowsExcluded: z.number().int().nonnegative(),
});
export type ClientSummary = z.infer<typeof clientSummarySchema>;

export const previewRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  importDate: isoDate,
  commodityCode: z.string().regex(/^\d{6,10}$/),
  description: z.string().max(200).nullable(),
  originCountry: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .nullable(),
  supplier: z.string().max(120).nullable(),
  netMassKg: z.number().finite().nonnegative(),
  customsValueGbp: gbp,
  entryReference: z.string().max(40).nullable(),
  supplierDeclaration: z.enum(['verified', 'unverified', 'none']).nullable(),
});
export type PreviewRow = z.infer<typeof previewRowSchema>;

export const createLiabilityPreviewInputSchema = z.object({
  fileSha256: z.string().regex(/^[a-f0-9]{64}$/),
  fileType: z.enum(['csv', 'xlsx']),
  sheetName: z.string().max(31).nullable(),
  rows: z.array(previewRowSchema).min(1).max(5000),
  clientSummary: clientSummarySchema,
});
export type CreateLiabilityPreviewInput = z.infer<typeof createLiabilityPreviewInputSchema>;

export const liabilityLineSchema = z.object({
  lineId: z.string(),
  rowNumber: z.number().int().positive(),
  importDate: isoDate,
  commodityCode: z.string(),
  description: z.string().nullable(),
  sector: sectorKey.nullable(),
  originCountry: z.string().nullable(),
  supplier: z.string().nullable(),
  massTonnes: z.number().nonnegative(),
  customsValueGbp: gbp,
  scope: z.enum(['in_scope', 'out_of_scope', 'before_start']),
  scopeReason: z.string(),
  emissionsBasis: z.enum(['default_value', 'supplier_actual']).nullable(),
  intensity: z.number().nonnegative().nullable(),
  intensityProvenance: provenanceKey.nullable(),
  embeddedEmissions: z.number().nonnegative().nullable(),
  grossGbp: gbp.nullable(),
  reliefGbp: gbp.nullable(),
  netGbp: z.number().finite().nullable(),
});
export type LiabilityLine = z.infer<typeof liabilityLineSchema>;

export const supplierExposureSchema = z.object({
  supplier: z.string(),
  rank: z.number().int().positive(),
  coveredLines: z.number().int().nonnegative(),
  otherLines: z.number().int().nonnegative(),
  coveredValueGbp: gbp,
  netGbp: z.number().finite(),
  shareOfNet: z.number().min(0).max(1),
  basis: z.enum(['supplier_actual', 'default_value', 'mixed', 'none']),
  missingData: z.boolean(),
});
export type SupplierExposure = z.infer<typeof supplierExposureSchema>;

const liabilityPreviewStatus = z.enum(LIABILITY_PREVIEW_STATUSES);

export const liabilityPreviewSchema = z.object({
  ...resultMeta,
  sessionId: previewSessionIdSchema,
  processingStatus: z.enum(['processing', 'complete', 'failed']),
  isDemo: z.boolean(),
  /** Which committed sample file this result was matched to; null in live mode. */
  fixtureKey: z.enum(FIXTURE_KEYS).nullable(),
  sampleNote: z.string().nullable(),
  status: liabilityPreviewStatus,
  rowCounts: z.object({
    received: z.number().int().nonnegative(),
    inScope: z.number().int().nonnegative(),
    outOfScope: z.number().int().nonnegative(),
    beforeStart: z.number().int().nonnegative(),
  }),
  /** The visitor's own validation counts, echoed on the POST response of a demo result only. */
  visitorCounts: clientSummarySchema.nullable(),
  summary: z.object({
    coveredLines: z.number().int().nonnegative(),
    coveredValueGbp: gbp,
    coveredMassTonnes: z.number().nonnegative(),
    embeddedEmissions: z.number().nonnegative(),
    grossGbp: gbp,
    reliefGbp: gbp,
    netGbp: z.number().finite(),
    provenance: z.literal('scenario'),
  }),
  threshold: z.object({
    amount: gbp.nullable(),
    provenance: provenanceKey,
    coveredValueGbp: gbp,
    ratio: z.number().nonnegative().nullable(),
    status: thresholdStatus.nullable(),
    periodFrom: isoDate.nullable(),
    periodTo: isoDate.nullable(),
    reason: z.string(),
  }),
  scopeReasons: z.array(
    z.object({
      scope: z.enum(['in_scope', 'out_of_scope', 'before_start']),
      label: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
  lines: z.array(liabilityLineSchema).max(5000),
  suppliers: z.array(supplierExposureSchema),
  methodology: z.object({
    inputs: z.array(z.string()),
    formula: z.array(z.object({ step: z.string(), text: z.string() })),
    assumptions: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        value: z.number(),
        unit: z.string(),
        provenance: provenanceKey,
        note: z.string(),
      }),
    ),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.url(),
        provenance: provenanceKey,
        date: isoDate.nullable(),
      }),
    ),
    missing: z.array(z.string()),
  }),
});
export type LiabilityPreview = z.infer<typeof liabilityPreviewSchema>;

export const apiErrorBodySchema = z.object({
  error: z.object({ code: z.enum(API_ERROR_CODES), message: z.string() }),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

export const guideSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  topic: z.enum(GUIDE_TOPICS),
  sectors: z.array(sectorKey),
  tags: z.array(z.string()),
  reviewedAt: z.iso.date(),
});
export const guideIndexSchema = z.object({ ...resultMeta, guides: z.array(guideSummarySchema) });
export type GuideIndex = z.infer<typeof guideIndexSchema>;
export const guideSchema = z.object({
  ...resultMeta,
  guide: guideSummarySchema.extend({ body: z.string() }),
});
export type Guide = z.infer<typeof guideSchema>;

export const rateAlertInputSchema = z.object({
  email: z.email().max(254),
  /** Confirms the visitor asked for rate and rules alerts. Required. */
  consent: z.literal(true),
  /** Separate, unticked by default. A rate-alert subscription is not marketing consent. */
  marketingConsent: z.boolean(),
});
export type RateAlertInput = z.infer<typeof rateAlertInputSchema>;

export const contactRequestInputSchema = z.object({
  email: z.email(),
  name: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
  /** Separate, unticked-by-default consent to marketing. Sending a request never implies it. */
  marketingConsent: z.boolean().default(false),
  kind: z.enum(['broker', 'general']),
});
export type ContactRequestInput = z.infer<typeof contactRequestInputSchema>;

export const acknowledgementSchema = z.object({
  ...resultMeta,
  received: z.literal(true),
  message: z.string(),
});
export type Acknowledgement = z.infer<typeof acknowledgementSchema>;
