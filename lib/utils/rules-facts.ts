import { rules as defaultRules } from '@/lib/config/rules';
import type { Rules, RuleStatus } from '@/lib/config/rules-schema';
import type { Provenance } from '@/lib/config/provenance';
import { formatDate, formatGBP } from './format';
import { getStartDateStatus } from './rules-dates';

/** Compact regulatory facts for the homepage fact strip. Every value comes from the rules config. */

export interface RuleFact {
  key: 'start' | 'threshold' | 'sectors' | 'retention';
  label: string;
  /** Display value, or "To be confirmed" when the rules config has no value. */
  value: string;
  detail: string;
  provenance: Provenance;
  sourceTitle: string;
  sourceUrl: string;
  confirmed: boolean;
}

const TO_CONFIRM = 'To be confirmed';

/** The rule statuses and the provenance badges share keys, so this is a straight mapping. */
function provenanceOf(status: RuleStatus): Provenance {
  return status;
}

export function getRuleFacts(now: Date = new Date(), source: Rules = defaultRules): RuleFact[] {
  const start = getStartDateStatus(now, source);
  const threshold = source.registrationThreshold.value;
  const sectors = source.sectors.value;
  const retention = source.recordRetention.value;
  const testCount = source.thresholdTests.value?.length ?? 0;

  return [
    {
      key: 'start',
      label: start.phase === 'in_force' ? 'In force since' : 'UK CBAM starts',
      value: start.date ? formatDate(start.date) : TO_CONFIRM,
      detail:
        start.phase === 'in_force'
          ? 'The charge applies to in-scope goods imported from this date.'
          : 'The charge is intended to apply to in-scope goods imported from this date.',
      provenance: provenanceOf(source.startDate.status),
      sourceTitle: source.startDate.sourceTitle,
      sourceUrl: source.startDate.sourceUrl,
      confirmed: start.date !== null,
    },
    {
      key: 'threshold',
      label: 'Registration threshold',
      value: threshold ? formatGBP(threshold.amount) : TO_CONFIRM,
      detail: threshold
        ? `Measured over ${threshold.period}${testCount > 1 ? `, with ${testCount} tests described in our rules snapshot` : ''}.`
        : 'The registration threshold is not yet confirmed in our rules snapshot.',
      provenance: provenanceOf(source.registrationThreshold.status),
      sourceTitle: source.registrationThreshold.sourceTitle,
      sourceUrl: source.registrationThreshold.sourceUrl,
      confirmed: threshold !== null,
    },
    {
      key: 'sectors',
      label: 'Sector groups',
      value: sectors ? String(sectors.length) : TO_CONFIRM,
      detail: sectors
        ? sectors.map((sector) => sector.label).join(', ')
        : 'The sector list is not yet confirmed in our rules snapshot.',
      provenance: provenanceOf(source.sectors.status),
      sourceTitle: source.sectors.sourceTitle,
      sourceUrl: source.sectors.sourceUrl,
      confirmed: sectors !== null,
    },
    {
      key: 'retention',
      label: 'Record retention',
      value: retention ?? TO_CONFIRM,
      detail: retention
        ? 'How long importers are expected to keep CBAM records.'
        : 'We do not show a retention period until it has been checked against HMRC guidance.',
      provenance: provenanceOf(source.recordRetention.status),
      sourceTitle: source.recordRetention.sourceTitle,
      sourceUrl: source.recordRetention.sourceUrl,
      confirmed: retention !== null,
    },
  ];
}
