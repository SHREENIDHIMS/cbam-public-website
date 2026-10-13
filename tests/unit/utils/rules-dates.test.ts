import { describe, expect, it } from 'vitest';
import { rules } from '@/lib/config/rules';
import { formatStartEyebrow, getStartDateStatus } from '@/lib/utils/rules-dates';

describe('start date helper', () => {
  it('says "starts" before the start date', () => {
    const status = getStartDateStatus(new Date('2026-10-06T10:00:00Z'));
    expect(status).toEqual({ phase: 'before', phrase: 'starts', date: '2027-01-01' });
    expect(formatStartEyebrow(new Date('2026-10-06T10:00:00Z'))).toBe('UK CBAM · live 1 Jan 2027');
  });

  it('is still "before" at the last minute of 31 December in London', () => {
    expect(getStartDateStatus(new Date('2026-12-31T23:59:00Z')).phase).toBe('before');
  });

  it('flips to "in force since" on the start date', () => {
    const now = new Date('2027-01-01T00:00:00Z');
    expect(getStartDateStatus(now).phase).toBe('in_force');
    expect(formatStartEyebrow(now)).toBe('UK CBAM · in force since 1 Jan 2027');
  });

  it('handles a missing start date without inventing one', () => {
    const source = { startDate: { ...rules.startDate, value: null } };
    expect(getStartDateStatus(new Date(), source).phase).toBe('unknown');
    expect(formatStartEyebrow(new Date(), source)).toContain('to be confirmed');
  });
});
