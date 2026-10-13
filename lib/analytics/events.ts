import { GUIDE_SLUGS } from '@/lib/content/guide-slugs';
import { LIABILITY_PREVIEW_STATUSES, RESULT_STATUS_KEYS } from '@/lib/config/status-keys';
import { UPLOAD_FIELD_KEYS } from '@/lib/config/upload-field-keys';

/**
 * Allowed analytics events. Every property is either a closed list of values or a boolean: no free
 * text, no numbers, nothing that could carry a name, email, filename, cell value or amount.
 *
 * This module ships to the browser on every page with a tracked link, so it is plain data plus a
 * tiny validator rather than a schema library.
 */

type EnumSpec = readonly string[];
type PropertySpec = EnumSpec | 'boolean';
type EventSpec = Readonly<Record<string, PropertySpec>>;

const location = [
  'header',
  'hero',
  'footer',
  'section',
  'result',
  'mobile_nav',
  'exposure_check',
  'tool',
] as const;
const cta = [
  'check_exposure',
  'quick_estimate',
  'upload',
  'sign_in',
  'create_workspace',
  'contact',
  'threshold_checker',
  'print',
] as const;
const thresholdStatus = ['below', 'watch', 'approaching', 'triggered'] as const;

export const analyticsEventSchemas = {
  cta_click: { location, cta },
  wizard_start: {},
  wizard_step: { step: ['1', '2', '3', '4', '5'] },
  wizard_complete: { status: RESULT_STATUS_KEYS },
  threshold_checked: {
    backward: thresholdStatus,
    forward: [...thresholdStatus, 'not_assessed'],
    lumpy: 'boolean',
  },
  upload_start: { fileType: ['csv', 'xlsx'] },
  upload_complete: { rowBand: ['under_100', '100_1000', '1000_5000'] },
  upload_failed: {
    reason: [
      'file_type',
      'file_size',
      'row_limit',
      'parse_error',
      'service_error',
      'macro_file',
      'no_headings',
      'no_data_rows',
      'no_valid_rows',
    ],
  },
  upload_step: { step: ['headings', 'mapping', 'validation', 'scope', 'preview'] },
  mapping_changed: {
    field: [...UPLOAD_FIELD_KEYS, 'ignore'],
    confidence: ['high', 'medium', 'low', 'none'],
  },
  preview_viewed: { status: LIABILITY_PREVIEW_STATUSES, isDemo: 'boolean' },
  methodology_opened: { tool: ['liability_preview'] },
  guide_open: { slug: GUIDE_SLUGS },
  rate_alert_subscribed: {},
  contact_submitted: { kind: ['broker', 'general'] },
  sign_in_click: { location },
} as const satisfies Readonly<Record<string, EventSpec>>;

export type AnalyticsEventName = keyof typeof analyticsEventSchemas;

type ValueOf<S> = S extends 'boolean' ? boolean : S extends readonly (infer U)[] ? U : never;
type PropertiesOf<S extends EventSpec> = { -readonly [K in keyof S]: ValueOf<S[K]> };

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: {
    name: K;
    properties: PropertiesOf<(typeof analyticsEventSchemas)[K]>;
  };
}[AnalyticsEventName];

/** True only when the properties have exactly the declared keys with allowed values. */
export function isValidEvent(name: string, properties: unknown): boolean {
  if (!Object.hasOwn(analyticsEventSchemas, name)) return false;
  if (typeof properties !== 'object' || properties === null) return false;
  const spec = analyticsEventSchemas[name as AnalyticsEventName] as EventSpec;
  const record = properties as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== Object.keys(spec).length) return false;
  return keys.every((key) => {
    const rule = spec[key];
    const value = record[key];
    if (rule === undefined) return false;
    if (rule === 'boolean') return typeof value === 'boolean';
    return typeof value === 'string' && rule.includes(value);
  });
}
