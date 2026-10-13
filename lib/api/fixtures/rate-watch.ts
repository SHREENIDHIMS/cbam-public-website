import 'server-only';
import { rules } from '@/lib/config/rules';
import { rateWatchSchema, type RateWatch } from '../schemas';

export function buildRateWatchFixture(): RateWatch {
  return rateWatchSchema.parse({
    rulesVersion: rules.rulesVersion,
    dataSource: 'fixture',
    officialRate: rules.rateState.value?.currentRate ?? null,
    scenarios: rules.scenarioRates.map((scenario) => ({
      key: scenario.key,
      label: scenario.label,
      ratePerTonne: scenario.ratePerTonne,
      note: scenario.note,
    })),
    events: rules.changelog.map((entry) => ({ date: entry.date, summary: entry.summary })),
  });
}
