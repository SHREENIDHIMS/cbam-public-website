// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  applyManualChange,
  confidenceFor,
  damerauLevenshtein,
  missingRequiredFields,
  scoreHeader,
  suggestMapping,
  toFieldColumns,
} from '@/lib/upload/column-matching';
import { normaliseHeader } from '@/lib/upload/normalise';
import { runPipeline } from '@/tests/utils/pipeline';

describe('scoring', () => {
  it('computes Damerau-Levenshtein distance with transpositions', () => {
    expect(damerauLevenshtein('abc', 'abc')).toBe(0);
    expect(damerauLevenshtein('comodity', 'commodity')).toBe(1);
    expect(damerauLevenshtein('ab', 'ba')).toBe(1);
  });

  it('scores exact, contained, fuzzy and generic matches', () => {
    const synonym = { text: 'commodity code', generic: false };
    expect(scoreHeader(normaliseHeader('Commodity Code'), synonym).score).toBe(1);
    expect(scoreHeader(normaliseHeader('Commodity code (CN)'), synonym).score).toBeCloseTo(0.8);
    expect(scoreHeader(normaliseHeader('Comodity code'), synonym).score).toBeCloseTo(0.836, 2);
    expect(scoreHeader(normaliseHeader('Banana'), synonym).score).toBe(0);
    expect(scoreHeader(normaliseHeader('Value'), { text: 'value', generic: true }).score).toBe(
      0.75,
    );
  });

  it('maps scores to confidence bands', () => {
    expect(confidenceFor(0.9)).toBe('high');
    expect(confidenceFor(0.75)).toBe('medium');
    expect(confidenceFor(0.65)).toBe('medium');
    expect(confidenceFor(0.5)).toBe('low');
    expect(confidenceFor(0.49)).toBe('none');
  });
});

describe('suggestions on the sample files', () => {
  it('Northstar maps everything with high confidence', async () => {
    const { mapping } = await runPipeline('northstar-steel-imports.csv');
    expect(mapping.every((entry) => entry.confidence === 'high')).toBe(true);
    expect(missingRequiredFields(mapping)).toEqual([]);
  });

  it('Meridian has medium matches for Origin and Value £, and a kg hint', async () => {
    const { mapping } = await runPipeline('meridian-aluminium.xlsx');
    const medium = mapping.filter((entry) => entry.confidence === 'medium');
    expect(medium.map((entry) => `${entry.header}>${entry.field}`).sort()).toEqual([
      'Origin>originCountry',
      'Value £>customsValue',
    ]);
    expect(medium.find((entry) => entry.field === 'originCountry')?.score).toBeCloseTo(0.75);
    expect(medium.find((entry) => entry.field === 'customsValue')?.score).toBeCloseTo(0.8);
    expect(mapping.find((entry) => entry.field === 'netMass')?.unitHint).toBe('kg');
  });

  it('Supplier B matches the misspelt commodity heading at medium confidence', async () => {
    const { mapping } = await runPipeline('supplier-b-messy.xlsx');
    const code = mapping.find((entry) => entry.header === 'Comodity code');
    expect(code).toMatchObject({ field: 'commodityCode', confidence: 'medium' });
    expect(code?.score).toBeCloseTo(0.886, 2);
    expect(code?.reason).toMatch(/Close spelling/);
    expect(mapping.find((entry) => entry.header === 'Origin')?.confidence).toBe('medium');
  });

  it('Broker maps Stat Value at medium confidence and the rest exactly', async () => {
    const { mapping } = await runPipeline('broker-export-messy.csv');
    expect(mapping.find((entry) => entry.header === 'Stat Value')).toMatchObject({
      field: 'customsValue',
      confidence: 'medium',
    });
    expect(mapping.find((entry) => entry.header === 'Ctry Origin')?.confidence).toBe('high');
    expect(mapping.find((entry) => entry.header === 'Consignor')?.confidence).toBe('high');
  });
});

describe('content check and generic cap', () => {
  const rows = (values: string[]) =>
    values.map((value, index) => ({ rowNumber: index + 2, cells: [value] }));

  it('lowers a heading match whose values do not look right', () => {
    const [good] = suggestMapping(['Value'], rows(['100', '200', '300']));
    const [bad] = suggestMapping(['Value'], rows(['alpha', 'beta', 'gamma']));
    expect(good?.score).toBeCloseTo(0.8);
    expect(bad).toMatchObject({ field: 'customsValue', confidence: 'low' });
    expect(bad?.reason).toMatch(/do not look like amounts/);
  });

  it('assigns each field to one column only', () => {
    const mapping = suggestMapping(['Supplier', 'Supplier name'], []);
    expect(mapping.filter((entry) => entry.field === 'supplier')).toHaveLength(1);
  });
});

describe('manual changes', () => {
  it('moves a field from the column that had it and reports the move', async () => {
    const { mapping } = await runPipeline('supplier-b-messy.xlsx');
    const supplier = mapping.find((entry) => entry.field === 'supplier')!;
    const description = mapping.find((entry) => entry.field === 'description')!;
    const result = applyManualChange(mapping, description.columnIndex, 'supplier');
    expect(result.moved).toEqual({
      fromHeader: supplier.header,
      toHeader: description.header,
      field: 'supplier',
    });
    expect(result.mapping[description.columnIndex]).toMatchObject({
      field: 'supplier',
      confidence: 'manual',
    });
    expect(result.mapping[supplier.columnIndex]?.field).toBe('ignore');
    expect(toFieldColumns(result.mapping).supplier).toBe(description.columnIndex);
  });

  it('lets a column be ignored and reports the missing required field', async () => {
    const { mapping } = await runPipeline('northstar-steel-imports.csv');
    const code = mapping.find((entry) => entry.field === 'commodityCode')!;
    const result = applyManualChange(mapping, code.columnIndex, 'ignore');
    expect(result.moved).toBeNull();
    expect(missingRequiredFields(result.mapping)).toEqual(['commodityCode']);
  });
});
