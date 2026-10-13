import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateShort,
  formatGBP,
  formatGBPRange,
  formatInteger,
  formatPercent,
  formatTonnes,
  toLondonIsoDate,
} from '@/lib/utils/format';

describe('format', () => {
  it('formats GBP in en-GB', () => {
    expect(formatGBP(50000)).toBe('£50,000');
    expect(formatGBP(1234.5, { pence: true })).toBe('£1,234.50');
  });

  it('formats ranges', () => {
    expect(formatGBPRange(10000, 25000)).toBe('£10,000 to £25,000');
  });

  it('formats tonnes, integers and percentages', () => {
    expect(formatTonnes(1234.56)).toBe('1,234.6 t');
    expect(formatInteger(5000)).toBe('5,000');
    expect(formatPercent(0.6)).toBe('60%');
  });

  it('formats dates long and short', () => {
    expect(formatDate('2027-01-01')).toBe('1 January 2027');
    expect(formatDateShort('2027-01-01')).toBe('1 Jan 2027');
    expect(formatDate(new Date('2026-10-06T12:00:00Z'))).toBe('6 October 2026');
  });

  it('resolves the London calendar date across the daylight saving boundary', () => {
    expect(toLondonIsoDate(new Date('2026-06-30T23:30:00Z'))).toBe('2026-07-01');
    expect(toLondonIsoDate(new Date('2026-12-31T23:30:00Z'))).toBe('2026-12-31');
  });
});
