import { describe, expect, it } from 'vitest';
import { rules } from '@/lib/config/rules';
import { RULE_DISPLAY_KEYS, getRuleDisplay } from '@/lib/utils/rules-display';

describe('getRuleDisplay', () => {
  it('formats rules values for guide bodies', () => {
    expect(getRuleDisplay('startDate').text).toBe('1 January 2027');
    expect(getRuleDisplay('registrationThreshold').text).toBe('£50,000');
    expect(getRuleDisplay('registrationThresholdPeriod').text).toBe('12 months');
    expect(getRuleDisplay('sectorCount').text).toBe('5');
    expect(getRuleDisplay('sectorList').text).toContain('iron and steel');
  });

  it('reads "To be confirmed" for a null value and never guesses', () => {
    const unset = { ...rules, startDate: { ...rules.startDate, value: null } };
    const display = getRuleDisplay('startDate', unset);
    expect(display.text).toBe('To be confirmed');
    expect(display.confirmed).toBe(false);
  });

  it('carries the status and source of every key', () => {
    for (const key of RULE_DISPLAY_KEYS) {
      const display = getRuleDisplay(key);
      expect(display.sourceUrl).toMatch(/^https:\/\//);
      expect(['official', 'proposed', 'scenario', 'unverified']).toContain(display.status);
    }
  });
});
