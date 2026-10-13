import { describe, expect, it } from 'vitest';
import { rules } from '@/lib/config/rules';
import { isPrimarySourceUrl, rulesSchema, ruleValueSchema } from '@/lib/config/rules-schema';
import { z } from 'zod';

const RULE_KEYS = [
  'startDate',
  'registrationThreshold',
  'thresholdTests',
  'thresholdExclusions',
  'sectors',
  'commodityScopeBasis',
  'registrationOpens',
  'registrationDeadline',
  'firstReturnDeadline',
  'paymentDeadline',
  'rateState',
  'carbonPriceRelief',
  'recordRetention',
] as const;

describe('rules config', () => {
  it('parses against the schema', () => {
    expect(rulesSchema.parse(rules).rulesVersion).toBe('public-rules-2026-10-06');
  });

  it('marks a value official only when it has a source date and a primary source', () => {
    for (const key of RULE_KEYS) {
      const rule = rules[key];
      if (rule.status === 'official') {
        expect(rule.sourceDate, key).not.toBeNull();
        expect(isPrimarySourceUrl(rule.sourceUrl), key).toBe(true);
        expect(rule.value, key).not.toBeNull();
      }
      if (rule.status === 'unverified') expect(rule.value, key).toBeNull();
    }
  });

  it('leaves the registration opening date unverified until its wording is confirmed', () => {
    expect(rules.registrationOpens.status).toBe('unverified');
    expect(rules.registrationOpens.value).toBeNull();
  });

  it('has no official rate and keeps scenario rates labelled as scenarios', () => {
    expect(rules.scenarioRates.every((rate) => rate.status === 'scenario')).toBe(true);
    expect(rules.rateState.value?.currentRate).toBeNull();
    expect(rules.scenarioRates.length).toBeGreaterThan(0);
  });

  it('has a changelog entry for the current version date', () => {
    expect(rules.changelog.length).toBeGreaterThan(0);
    expect(rules.rulesVersion).toContain(rules.changelog[0]!.date);
  });

  it('only allows primary source domains unless scenario', () => {
    expect(isPrimarySourceUrl('https://www.gov.uk/guidance/x')).toBe(true);
    expect(isPrimarySourceUrl('https://www.legislation.gov.uk/ukpga/2025/1')).toBe(true);
    expect(isPrimarySourceUrl('https://assets.publishing.service.gov.uk/x.pdf')).toBe(true);
    expect(isPrimarySourceUrl('https://example.com/gov.uk')).toBe(false);
    expect(isPrimarySourceUrl('https://evilgov.uk/x')).toBe(false);
    expect(isPrimarySourceUrl('http://www.gov.uk/x')).toBe(false);

    const schema = ruleValueSchema(z.string());
    const base = {
      value: 'x',
      sourceTitle: 't',
      sourceUrl: 'https://example.com/a',
      sourceDate: null,
      reviewedAt: '2026-10-06',
    };
    expect(schema.safeParse({ ...base, status: 'unverified' }).success).toBe(false);
    expect(schema.safeParse({ ...base, status: 'scenario' }).success).toBe(true);
  });

  it('refuses an official value without a source date', () => {
    const schema = ruleValueSchema(z.string());
    expect(
      schema.safeParse({
        value: 'x',
        status: 'official',
        sourceTitle: 't',
        sourceUrl: 'https://www.gov.uk/a',
        sourceDate: null,
        reviewedAt: '2026-10-06',
      }).success,
    ).toBe(false);
  });
});
