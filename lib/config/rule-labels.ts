/** Plain-English names for the keys in lib/config/rules.ts, used by the changelog pages. */

export const RULE_LABELS: Readonly<Record<string, string>> = {
  startDate: 'Start date',
  registrationThreshold: 'Registration threshold',
  thresholdTests: 'Threshold tests',
  thresholdExclusions: 'Goods that may not count towards the threshold',
  sectors: 'Sectors in scope',
  commodityScopeBasis: 'Commodity-code scope',
  registrationOpens: 'Registration opening date',
  registrationDeadline: 'First-year registration deadline',
  firstReturnDeadline: 'First return deadline',
  paymentDeadline: 'First payment deadline',
  rateState: 'CBAM rate',
  scenarioRates: 'Scenario rates',
  carbonPriceRelief: 'Carbon price relief',
  recordRetention: 'Record retention',
};

export function ruleLabel(key: string): string {
  return RULE_LABELS[key] ?? key;
}
