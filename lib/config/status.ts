import { LIABILITY_PREVIEW_STATUSES, RESULT_STATUS_KEYS, type ResultStatus } from './status-keys';

export { LIABILITY_PREVIEW_STATUSES, RESULT_STATUS_KEYS, type ResultStatus };

/** Single definition of the canonical result statuses (MASTER_PROMPT 31.1). */

export const TONES = ['positive', 'info', 'watch', 'critical', 'neutral'] as const;
export type Tone = (typeof TONES)[number];

export const STATUS_ICON_NAMES = [
  'CircleCheck',
  'Eye',
  'TriangleAlert',
  'CircleAlert',
  'OctagonAlert',
  'CircleHelp',
] as const;
export type StatusIconName = (typeof STATUS_ICON_NAMES)[number];

export interface StatusDefinition {
  key: ResultStatus;
  label: string;
  description: string;
  resultHeadline: string;
  tone: Tone;
  icon: StatusIconName;
}

export const RESULT_STATUSES: Readonly<Record<ResultStatus, StatusDefinition>> = {
  below: {
    key: 'below',
    label: 'Below threshold',
    description: 'Below the threshold on the information supplied',
    resultHeadline: 'Below threshold, based on the information supplied',
    tone: 'positive',
    icon: 'CircleCheck',
  },
  watch: {
    key: 'watch',
    label: 'Watch',
    description: 'Below the threshold, within the configured watch band',
    resultHeadline: 'Below threshold, but worth watching',
    tone: 'info',
    icon: 'Eye',
  },
  approaching: {
    key: 'approaching',
    label: 'Approaching threshold',
    description: 'Close to the threshold; real customs data recommended',
    resultHeadline: 'Approaching the threshold on the information supplied',
    tone: 'watch',
    icon: 'TriangleAlert',
  },
  likely_triggered: {
    key: 'likely_triggered',
    label: 'Likely triggered',
    description: 'Likely over; confirm using the detailed ledger tests',
    resultHeadline: 'Likely over the threshold on the information supplied',
    tone: 'critical',
    icon: 'CircleAlert',
  },
  triggered: {
    key: 'triggered',
    label: 'Triggered',
    description: 'Over the threshold on the inputs supplied',
    resultHeadline: 'Over the threshold on the inputs supplied',
    tone: 'critical',
    icon: 'OctagonAlert',
  },
  needs_data: {
    key: 'needs_data',
    label: 'Not enough information',
    description: 'Not enough information for a reliable view',
    resultHeadline: 'Not enough information for a reliable view yet',
    tone: 'neutral',
    icon: 'CircleHelp',
  },
};

export const QUICK_ESTIMATE_STATUSES = [
  'below',
  'approaching',
  'likely_triggered',
  'needs_data',
] as const satisfies readonly ResultStatus[];

export const THRESHOLD_STATUSES = [
  'below',
  'watch',
  'approaching',
  'triggered',
] as const satisfies readonly ResultStatus[];

export function getStatus(key: ResultStatus): StatusDefinition {
  return RESULT_STATUSES[key];
}

export type ThresholdStatus = (typeof THRESHOLD_STATUSES)[number];
