import { describe, expect, it } from 'vitest';
import { rules } from '@/lib/config/rules';
import { getRuleFacts } from '@/lib/utils/rules-facts';

const BEFORE = new Date('2026-10-06T10:00:00Z');
const AFTER = new Date('2027-02-01T10:00:00Z');

describe('getRuleFacts', () => {
  it('builds the four facts from the rules config, each with its provenance', () => {
    const facts = getRuleFacts(BEFORE);
    expect(facts.map((fact) => fact.key)).toEqual(['start', 'threshold', 'sectors', 'retention']);
    expect(facts.find((fact) => fact.key === 'start')?.value).toBe('1 January 2027');
    expect(facts.find((fact) => fact.key === 'threshold')?.value).toBe('£50,000');
    expect(facts.find((fact) => fact.key === 'sectors')?.value).toBe('5');
    for (const fact of facts) {
      expect(fact.provenance).toBe('official');
      expect(fact.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('never invents a value: a null value reads "To be confirmed"', () => {
    const unset = { ...rules, recordRetention: { ...rules.recordRetention, value: null } };
    const retention = getRuleFacts(BEFORE, unset).find((fact) => fact.key === 'retention');
    expect(retention?.value).toBe('To be confirmed');
    expect(retention?.confirmed).toBe(false);
  });

  it('is date-aware for the start label', () => {
    expect(getRuleFacts(BEFORE)[0]?.label).toBe('UK CBAM starts');
    expect(getRuleFacts(AFTER)[0]?.label).toBe('In force since');
  });

  it('follows the rules status when a value is verified', () => {
    const facts = getRuleFacts(BEFORE, {
      ...rules,
      registrationThreshold: {
        ...rules.registrationThreshold,
        status: 'official',
        sourceDate: '2026-09-01',
        value: { amount: 75000, currency: 'GBP', period: '12 months' },
      },
    });
    const threshold = facts.find((fact) => fact.key === 'threshold');
    expect(threshold?.value).toBe('£75,000');
    expect(threshold?.provenance).toBe('official');
  });
});
