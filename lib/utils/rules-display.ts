import { rules as defaultRules } from '@/lib/config/rules';
import type { Rules, RuleStatus } from '@/lib/config/rules-schema';
import { formatDate, formatGBP } from './format';

/** Display text for a rules value, by key. The only place guide bodies turn rules into text. */

export const RULE_DISPLAY_KEYS = [
  'startDate',
  'registrationThreshold',
  'registrationThresholdPeriod',
  'registrationDeadline',
  'firstReturnDeadline',
  'paymentDeadline',
  'recordRetention',
  'sectorList',
  'sectorCount',
] as const;
export type RuleDisplayKey = (typeof RULE_DISPLAY_KEYS)[number];

export interface RuleDisplay {
  text: string;
  status: RuleStatus;
  sourceTitle: string;
  sourceUrl: string;
  confirmed: boolean;
}

const TO_CONFIRM = 'To be confirmed';

export function isRuleDisplayKey(key: string): key is RuleDisplayKey {
  return (RULE_DISPLAY_KEYS as readonly string[]).includes(key);
}

export function getRuleDisplay(key: RuleDisplayKey, source: Rules = defaultRules): RuleDisplay {
  const make = (
    rule: { status: RuleStatus; sourceTitle: string; sourceUrl: string },
    text: string | null,
  ): RuleDisplay => ({
    text: text ?? TO_CONFIRM,
    status: rule.status,
    sourceTitle: rule.sourceTitle,
    sourceUrl: rule.sourceUrl,
    confirmed: text !== null,
  });

  switch (key) {
    case 'startDate':
      return make(
        source.startDate,
        source.startDate.value ? formatDate(source.startDate.value) : null,
      );
    case 'registrationThreshold':
      return make(
        source.registrationThreshold,
        source.registrationThreshold.value
          ? formatGBP(source.registrationThreshold.value.amount)
          : null,
      );
    case 'registrationThresholdPeriod':
      return make(source.registrationThreshold, source.registrationThreshold.value?.period ?? null);
    case 'registrationDeadline':
      return make(
        source.registrationDeadline,
        source.registrationDeadline.value ? formatDate(source.registrationDeadline.value) : null,
      );
    case 'firstReturnDeadline':
      return make(
        source.firstReturnDeadline,
        source.firstReturnDeadline.value ? formatDate(source.firstReturnDeadline.value) : null,
      );
    case 'paymentDeadline':
      return make(
        source.paymentDeadline,
        source.paymentDeadline.value ? formatDate(source.paymentDeadline.value) : null,
      );
    case 'recordRetention':
      return make(source.recordRetention, source.recordRetention.value);
    case 'sectorList':
      return make(
        source.sectors,
        source.sectors.value
          ? source.sectors.value.map((sector) => sector.label.toLowerCase()).join(', ')
          : null,
      );
    case 'sectorCount':
      return make(
        source.sectors,
        source.sectors.value ? String(source.sectors.value.length) : null,
      );
  }
}
