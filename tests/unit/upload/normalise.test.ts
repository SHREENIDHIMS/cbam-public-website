import { describe, expect, it } from 'vitest';
import {
  detectDecimalMode,
  isTotalCell,
  normaliseCommodityCode,
  normaliseCountry,
  normaliseCurrency,
  normaliseDeclaration,
  normaliseHeader,
  normaliseText,
  parseDateCell,
  parseNumberCell,
} from '@/lib/upload/normalise';

const dot = { mode: 'dot', majority: 'dot' } as const;
const comma = { mode: 'comma', majority: 'comma' } as const;

describe('normaliseHeader', () => {
  it('folds case and diacritics and tokenises', () => {
    expect(normaliseHeader('  Türkiye   Origin ')).toMatchObject({
      text: 'turkiye origin',
      tokens: ['turkiye', 'origin'],
      unitHint: null,
    });
  });

  it('pulls out unit hints', () => {
    expect(normaliseHeader('Net weight (kg)')).toMatchObject({
      text: 'net weight',
      unitHint: 'kg',
    });
    expect(normaliseHeader('Net mass (Tonnes)')).toMatchObject({ text: 'net mass', unitHint: 't' });
    expect(normaliseHeader('Customs value (GBP)')).toMatchObject({
      text: 'customs value',
      unitHint: 'gbp',
    });
    expect(normaliseHeader('Value £')).toMatchObject({ text: 'value', unitHint: 'gbp' });
    expect(normaliseHeader('Declaration no.')).toMatchObject({ text: 'declaration no' });
  });
});

describe('parseDateCell', () => {
  it.each([
    ['2027-01-14', '2027-01-14'],
    ['14/01/2027', '2027-01-14'],
    ['3/2/2027', '2027-02-03'],
    ['14-01-2027', '2027-01-14'],
    ['14.01.2027', '2027-01-14'],
    ['14 Jan 2027', '2027-01-14'],
    ['14 January 2027', '2027-01-14'],
  ])('reads %s', (raw, iso) => {
    expect(parseDateCell(raw)).toEqual({ value: iso });
  });

  it('reads Date cells by their UTC calendar day', () => {
    expect(parseDateCell(new Date('2027-01-20T00:00:00Z'))).toEqual({ value: '2027-01-20' });
  });

  it('reads Excel serial numbers and flags them as fixed', () => {
    expect(parseDateCell(46_388)).toEqual({
      value: '2027-01-01',
      issue: { code: 'excel_serial_date', severity: 'fixed' },
    });
  });

  it.each(['2027-13-02', '31/02/2027', 'yesterday', '14/01/27', '1999-01-01'])(
    'rejects %s as malformed',
    (raw) => {
      expect(parseDateCell(raw)).toEqual({
        value: null,
        issue: { code: 'malformed_date', severity: 'error' },
      });
    },
  );

  it('reports blank cells as empty', () => {
    expect(parseDateCell('  ')).toEqual({ value: null, empty: true });
    expect(parseDateCell(null)).toEqual({ value: null, empty: true });
  });
});

describe('detectDecimalMode', () => {
  it('detects commas, dots, and a mixture', () => {
    expect(detectDecimalMode(['12,5 t', '28,5 t', '1.234,50'])).toEqual(comma);
    expect(detectDecimalMode(['12.5', '1,234.50'])).toEqual(dot);
    expect(detectDecimalMode(['12', '1500'])).toEqual(dot);
    expect(detectDecimalMode(['12,5', '3,5', '4.25'])).toMatchObject({
      mode: 'mixed',
      majority: 'comma',
    });
    expect(detectDecimalMode([12.5, 3])).toEqual(dot);
  });
});

describe('parseNumberCell', () => {
  it('reads plain and numeric cells', () => {
    expect(parseNumberCell(1500, dot, 'mass')).toEqual({ value: 1500 });
    expect(parseNumberCell('48000', dot, 'mass')).toEqual({ value: 48000 });
    expect(parseNumberCell('1,234.50', dot, 'money')).toEqual({ value: 1234.5 });
    expect(parseNumberCell('£1,200', dot, 'money')).toEqual({ value: 1200 });
    expect(parseNumberCell('1 234', dot, 'money')).toEqual({ value: 1234 });
  });

  it('reads decimal commas in a comma column', () => {
    expect(parseNumberCell('9875,00', comma, 'money')).toEqual({ value: 9875 });
    expect(parseNumberCell('1.234,50', comma, 'money')).toEqual({ value: 1234.5 });
  });

  it('converts a unit in the cell and flags it as fixed', () => {
    expect(parseNumberCell('12,5 t', comma, 'mass')).toEqual({
      value: 12.5,
      unit: 't',
      issue: { code: 'unit_in_numeric', severity: 'fixed' },
    });
    expect(parseNumberCell('900 kg', dot, 'mass')).toMatchObject({ value: 900, unit: 'kg' });
    expect(parseNumberCell('2 tonnes', dot, 'mass')).toMatchObject({ value: 2, unit: 't' });
  });

  it('sends unsupported units and currencies to review', () => {
    expect(parseNumberCell('6 bags', dot, 'mass').issue).toEqual({
      code: 'unsupported_unit',
      severity: 'review',
    });
    expect(parseNumberCell('€1,200', dot, 'money').issue?.code).toBe('unsupported_currency');
    expect(parseNumberCell('1200 EUR', dot, 'money').issue?.code).toBe('unsupported_currency');
    expect(parseNumberCell('abc', dot, 'money').issue?.code).toBe('unsupported_value');
    expect(parseNumberCell('-5', dot, 'mass').issue?.code).toBe('unsupported_value');
    expect(parseNumberCell(-5, dot, 'mass').issue?.code).toBe('unsupported_value');
  });

  it('flags cells that use the minority convention in a mixed column', () => {
    const mixed = { mode: 'mixed', majority: 'comma' } as const;
    expect(parseNumberCell('4.25', mixed, 'money').issue?.code).toBe('ambiguous_number');
    expect(parseNumberCell('3,5', mixed, 'money')).toEqual({ value: 3.5 });
  });

  it('reports blank cells as empty', () => {
    expect(parseNumberCell('', dot, 'money')).toEqual({ value: null, empty: true });
  });
});

describe('other normalisers', () => {
  it('normalises commodity codes', () => {
    expect(normaliseCommodityCode('7208390000')).toEqual({ value: '7208390000' });
    expect(normaliseCommodityCode(7601100000)).toEqual({ value: '7601100000' });
    expect(normaliseCommodityCode('2523.29.00.00')).toEqual({
      value: '2523290000',
      issue: { code: 'commodity_code_normalised', severity: 'fixed' },
    });
    expect(normaliseCommodityCode('7208 39').value).toBe('720839');
    expect(normaliseCommodityCode('ABC').issue?.code).toBe('invalid_commodity_code');
    expect(normaliseCommodityCode('123').issue?.code).toBe('invalid_commodity_code');
    expect(normaliseCommodityCode('').empty).toBe(true);
  });

  it('normalises countries without guessing', () => {
    expect(normaliseCountry('tr')).toEqual({ value: 'TR' });
    expect(normaliseCountry('Türkiye')).toEqual({
      value: 'TR',
      issue: { code: 'country_name_normalised', severity: 'fixed' },
    });
    expect(normaliseCountry('Viet Nam').value).toBe('VN');
    expect(normaliseCountry('Narnia')).toEqual({
      value: null,
      issue: { code: 'unknown_country', severity: 'note' },
    });
    expect(normaliseCountry('XX').issue?.code).toBe('unknown_country');
  });

  it('normalises declarations, checking unverified before verified', () => {
    expect(normaliseDeclaration('Verified').value).toBe('verified');
    expect(normaliseDeclaration('Unverified')).toEqual({
      value: 'unverified',
      issue: { code: 'unverified_declaration', severity: 'note' },
    });
    expect(normaliseDeclaration('None').value).toBe('none');
    expect(normaliseDeclaration('n/a').value).toBe('none');
    expect(normaliseDeclaration(null).value).toBe('none');
    expect(normaliseDeclaration('maybe').issue?.code).toBe('unrecognised_declaration');
  });

  it('normalises currency and text', () => {
    expect(normaliseCurrency('GBP').value).toBe('GBP');
    expect(normaliseCurrency('').value).toBe('GBP');
    expect(normaliseCurrency('EUR').issue?.code).toBe('unsupported_currency');
    expect(normaliseText('  a   b ', 10)).toEqual({ value: 'a b' });
    expect(normaliseText('abcdefghij', 5)).toEqual({
      value: 'abcde',
      issue: { code: 'text_truncated', severity: 'note' },
    });
  });

  it('detects whole-cell total labels only', () => {
    expect(isTotalCell('Total')).toBe(true);
    expect(isTotalCell('Grand total')).toBe(true);
    expect(isTotalCell('Subtotal:')).toBe(true);
    expect(isTotalCell('Total Energies Ltd')).toBe(false);
    expect(isTotalCell(100)).toBe(false);
  });
});
