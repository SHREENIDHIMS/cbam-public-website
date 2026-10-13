import '@/lib/validation/zod-browser';
import { z } from 'zod';
import {
  LARGE_SHIPMENT_KEYS,
  LARGE_SHIPMENT_OPTIONS,
  ORIGIN_GROUP_KEYS,
  ORIGIN_GROUPS,
  SUPPLIER_BAND_KEYS,
  SUPPLIER_BANDS,
  VALUE_BAND_KEYS,
  VALUE_BANDS,
  type LargeShipmentKey,
  type OriginGroupKey,
  type SupplierBandKey,
  type ValueBandKey,
} from './quick-estimate-options';

export { LARGE_SHIPMENT_KEYS, ORIGIN_GROUP_KEYS, SUPPLIER_BAND_KEYS, VALUE_BAND_KEYS };
export type { LargeShipmentKey, OriginGroupKey, SupplierBandKey, ValueBandKey };

/**
 * Product guidance for the public tools. Nothing here is a statutory value.
 * Guidance bands are labelled "Product guidance, not a statutory value" wherever shown.
 */

export const NEXT_ACTION_KEYS = ['upload', 'threshold', 'guides', 'quick_estimate'] as const;
export type NextActionKey = (typeof NEXT_ACTION_KEYS)[number];

const limit = z.object({ max: z.number().int(), windowMs: z.number().int() });
const labelled = <K extends z.ZodType<string>>(key: K) =>
  z.object({ key, label: z.string().min(1) });

export const toolsConfigSchema = z.object({
  thresholdGuidanceBands: z.object({
    watchFrom: z.number().min(0).max(1),
    approachingFrom: z.number().min(0).max(1),
    label: z.string(),
  }),
  thresholdChecker: z.object({
    /** The gauge scale runs from zero to this multiple of the threshold. */
    gaugeMaxRatio: z.number().gt(1),
  }),
  quickEstimate: z.object({
    valueBands: z.array(
      z.object({
        key: z.enum(VALUE_BAND_KEYS),
        label: z.string().min(1),
        min: z.number().nonnegative().nullable(),
        max: z.number().positive().nullable(),
      }),
    ),
    supplierBands: z.array(labelled(z.enum(SUPPLIER_BAND_KEYS))),
    originGroups: z.array(labelled(z.enum(ORIGIN_GROUP_KEYS))),
    largeShipmentOptions: z.array(
      labelled(z.enum(LARGE_SHIPMENT_KEYS)).extend({ description: z.string().min(1) }),
    ),
  }),
  nextActionRoutes: z.object({
    upload: z.literal('/liability-preview'),
    threshold: z.literal('/threshold-checker'),
    guides: z.literal('/guides'),
    quick_estimate: z.literal('/quick-estimate'),
  }),
  upload: z.object({
    maxFileBytes: z.number().int().positive(),
    maxDataRows: z.number().int().positive(),
    extensions: z.array(z.string()),
    maxJsonBodyBytes: z.number().int().positive(),
    /** How many leading rows are scanned for the heading row. */
    headerScanRows: z.number().int().positive(),
    /** Issues shown before "Show all". */
    issuePageSize: z.number().int().positive(),
    /** Browsers report CSV and XLSX MIME types inconsistently; an empty type is allowed. */
    mimeAllowList: z.object({ csv: z.array(z.string()), xlsx: z.array(z.string()) }),
  }),
  rateLimits: z.object({
    forms: limit,
    liabilityPreview: limit,
    toolCalls: limit,
  }),
});

export const toolsConfig = toolsConfigSchema.parse({
  thresholdGuidanceBands: {
    watchFrom: 0.6,
    approachingFrom: 0.8,
    label: 'Product guidance, not a statutory value',
  },
  thresholdChecker: { gaugeMaxRatio: 1.25 },
  quickEstimate: {
    valueBands: [...VALUE_BANDS],
    supplierBands: [...SUPPLIER_BANDS],
    originGroups: [...ORIGIN_GROUPS],
    largeShipmentOptions: [...LARGE_SHIPMENT_OPTIONS],
  },
  nextActionRoutes: {
    upload: '/liability-preview',
    threshold: '/threshold-checker',
    guides: '/guides',
    quick_estimate: '/quick-estimate',
  },
  upload: {
    maxFileBytes: 10 * 1024 * 1024,
    maxDataRows: 5000,
    extensions: ['.csv', '.xlsx'],
    maxJsonBodyBytes: 2 * 1024 * 1024,
    headerScanRows: 20,
    issuePageSize: 50,
    mimeAllowList: {
      csv: [
        '',
        'text/csv',
        'application/csv',
        'text/plain',
        'application/vnd.ms-excel',
        'text/comma-separated-values',
      ],
      xlsx: [
        '',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
        'application/zip',
      ],
    },
  },
  rateLimits: {
    forms: { max: 5, windowMs: 10 * 60 * 1000 },
    liabilityPreview: { max: 10, windowMs: 10 * 60 * 1000 },
    toolCalls: { max: 30, windowMs: 60 * 1000 },
  },
});

export type ValueBand = (typeof toolsConfig.quickEstimate.valueBands)[number];

export function getValueBand(key: ValueBandKey): ValueBand {
  const band = toolsConfig.quickEstimate.valueBands.find((candidate) => candidate.key === key);
  if (!band) throw new Error(`Unknown value band ${key}`);
  return band;
}
