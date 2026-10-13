import 'server-only';
import { rules } from '@/lib/config/rules';
import { publicRulesSummarySchema, type PublicRulesSummary } from '../schemas';

export function buildRulesSummaryFixture(): PublicRulesSummary {
  return publicRulesSummarySchema.parse({
    rulesVersion: rules.rulesVersion,
    dataSource: 'fixture',
    reviewedAt: rules.reviewedAt,
    startDate: rules.startDate.value,
    thresholdAmount: rules.registrationThreshold.value?.amount ?? null,
    sectors: rules.sectors.value ?? [],
    allUnverified: [rules.startDate, rules.registrationThreshold, rules.sectors].every(
      (rule) => rule.status === 'unverified',
    ),
  });
}
