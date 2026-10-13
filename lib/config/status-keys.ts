/** Status keys without any schema library, so browser code (analytics) can import them cheaply. */

export const RESULT_STATUS_KEYS = [
  'below',
  'watch',
  'approaching',
  'likely_triggered',
  'triggered',
  'needs_data',
] as const;
export type ResultStatus = (typeof RESULT_STATUS_KEYS)[number];

export const LIABILITY_PREVIEW_STATUSES = [
  'below',
  'approaching',
  'triggered',
  'needs_data',
] as const satisfies readonly ResultStatus[];
