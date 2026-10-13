import { describe, expect, it } from 'vitest';
import { FIXTURE_LINES } from '@/lib/api/fixtures/liability-lines';
import {
  buildFixturePreview,
  fixtureKeyFromSessionId,
} from '@/lib/api/fixtures/liability-previews';
import { FIXTURE_KEYS, liabilityPreviewSchema } from '@/lib/api/schemas';
import { rules } from '@/lib/config/rules';

const preview = (key: (typeof FIXTURE_KEYS)[number]) => buildFixturePreview(key);

describe('Northstar golden result', () => {
  const result = preview('northstar');

  it('matches the worked totals', () => {
    expect(result.summary).toEqual({
      coveredLines: 5,
      coveredValueGbp: 71750,
      coveredMassTonnes: 125,
      embeddedEmissions: 195.14,
      grossGbp: 9757,
      reliefGbp: 683.52,
      netGbp: 9073.48,
      provenance: 'scenario',
    });
    expect(result.rowCounts).toEqual({ received: 7, inScope: 5, outOfScope: 1, beforeStart: 1 });
    expect(result.scopeReasons.map((entry) => entry.count)).toEqual([5, 1, 1]);
  });

  it('puts the coil line on supplier actual data with relief', () => {
    const coil = result.lines.find((line) => line.rowNumber === 3)!;
    expect(coil).toMatchObject({
      emissionsBasis: 'supplier_actual',
      intensity: 1.78,
      embeddedEmissions: 85.44,
      grossGbp: 4272,
      reliefGbp: 683.52,
      netGbp: 3588.48,
      intensityProvenance: 'supplier_actual',
    });
  });

  it('leaves out-of-scope and before-start lines uncalculated', () => {
    for (const row of [2, 6]) {
      const line = result.lines.find((candidate) => candidate.rowNumber === row)!;
      expect(line.netGbp).toBeNull();
      expect(line.embeddedEmissions).toBeNull();
    }
    expect(result.lines.find((line) => line.rowNumber === 2)?.scope).toBe('before_start');
    expect(result.lines.find((line) => line.rowNumber === 6)?.scope).toBe('out_of_scope');
  });

  it('reports the threshold position and ranks suppliers', () => {
    expect(result.status).toBe('triggered');
    expect(result.threshold).toMatchObject({
      status: 'triggered',
      coveredValueGbp: 71750,
      periodFrom: '2027-01-12',
      periodTo: '2027-04-02',
      provenance: 'official',
    });
    expect(result.threshold.ratio).toBeCloseTo(1.435);
    expect(result.threshold.reason).toMatch(/threshold \(Official\)/);
    expect(result.suppliers.map((s) => [s.supplier, s.netGbp, s.basis, s.missingData])).toEqual([
      ['Atlas Metals', 3885, 'default_value', true],
      ['Meridian Alloy Works', 3588.48, 'supplier_actual', false],
      ['North Channel Materials', 1600, 'default_value', true],
    ]);
    expect(result.suppliers.map((s) => [s.coveredLines, s.otherLines])).toEqual([
      [3, 0],
      [1, 1],
      [1, 1],
    ]);
  });
});

describe('Meridian, Supplier B and broker golden results', () => {
  it('Meridian: below threshold, default values only', () => {
    const result = preview('meridian');
    expect(result.summary).toMatchObject({
      coveredLines: 3,
      coveredValueGbp: 17610,
      coveredMassTonnes: 5.7,
      embeddedEmissions: 42.75,
      grossGbp: 2137.5,
      reliefGbp: 0,
      netGbp: 2137.5,
    });
    expect(result.status).toBe('below');
    expect(result.threshold.ratio).toBeCloseTo(0.3522);
    expect(result.suppliers.map((s) => [s.supplier, s.netGbp, s.basis])).toEqual([
      ['Meridian Alloy Works', 1687.5, 'default_value'],
      ['Atlas Metals', 450, 'default_value'],
      ['North Channel Materials', 0, 'none'],
    ]);
  });

  it('Supplier B: approaching, with one supplier actual line', () => {
    const result = preview('supplier_b');
    expect(result.summary).toMatchObject({
      coveredLines: 4,
      coveredValueGbp: 40614.5,
      coveredMassTonnes: 61.4,
      embeddedEmissions: 97.12,
      grossGbp: 4856,
      reliefGbp: 437.76,
      netGbp: 4418.24,
    });
    expect(result.status).toBe('approaching');
    expect(result.threshold.ratio).toBeCloseTo(0.81229, 4);
    expect(result.lines.find((line) => line.rowNumber === 6)).toMatchObject({
      emissionsBasis: 'supplier_actual',
      intensity: 1.92,
      netGbp: 2298.24,
    });
    // An unverified declaration never earns supplier-actual treatment.
    expect(result.lines.find((line) => line.rowNumber === 4)?.emissionsBasis).toBe('default_value');
    expect(result.suppliers.map((s) => [s.supplier, s.netGbp, s.missingData])).toEqual([
      ['Atlas Metals', 2298.24, false],
      ['North Channel Materials', 1220, true],
      ['Meridian Alloy Works', 900, true],
    ]);
  });

  it('Broker export: below threshold, scrap out of scope', () => {
    const result = preview('broker_export');
    expect(result.summary).toMatchObject({
      coveredLines: 3,
      coveredValueGbp: 18215,
      coveredMassTonnes: 74.5,
      embeddedEmissions: 89.25,
      grossGbp: 4462.5,
      reliefGbp: 0,
      netGbp: 4462.5,
    });
    expect(result.status).toBe('below');
    expect(result.threshold.ratio).toBeCloseTo(0.3643, 4);
    expect(result.suppliers.map((s) => [s.supplier, s.netGbp, s.otherLines])).toEqual([
      ['North Channel Materials', 2400, 1],
      ['Atlas Metals', 1312.5, 0],
      ['Meridian Alloy Works', 750, 0],
    ]);
  });
});

describe('demo result', () => {
  it('reuses the Northstar lines, is labelled, and echoes visitor counts only when given', () => {
    const counts = {
      rowsFound: 3,
      included: 2,
      normalised: 0,
      needsReview: 1,
      duplicates: 0,
      rejected: 0,
      totalRowsExcluded: 0,
    };
    const demo = buildFixturePreview('demo', counts);
    expect(demo.isDemo).toBe(true);
    expect(demo.sampleNote).toMatch(/not calculated from your file/);
    expect(demo.visitorCounts).toEqual(counts);
    expect(demo.summary).toEqual(preview('northstar').summary);
    expect(buildFixturePreview('demo').visitorCounts).toBeNull();
    expect(preview('northstar').isDemo).toBe(false);
    expect(preview('northstar').visitorCounts).toBeNull();
  });
});

describe('every fixture', () => {
  it.each(FIXTURE_KEYS)('%s is schema valid and carries scenario provenance', (key) => {
    const result = preview(key);
    expect(liabilityPreviewSchema.safeParse(result).success).toBe(true);
    expect(result.dataSource).toBe('fixture');
    expect(result.rulesVersion).toBe(rules.rulesVersion);
    expect(result.summary.provenance).toBe('scenario');
    for (const line of result.lines.filter((candidate) => candidate.scope === 'in_scope')) {
      expect(['scenario', 'supplier_actual']).toContain(line.intensityProvenance);
    }
    expect(result.methodology.assumptions.some((entry) => entry.key === 'rate')).toBe(true);
    expect(result.methodology.missing.join(' ')).toMatch(/No official CBAM rate/);
    for (const assumption of result.methodology.assumptions) {
      expect(['scenario', 'supplier_actual']).toContain(assumption.provenance);
    }
  });

  it('lines marked before_start are before the rules start date, and the others are not', () => {
    const start = rules.startDate.value!;
    for (const key of FIXTURE_KEYS) {
      for (const line of FIXTURE_LINES[key]) {
        if (line.scope === 'before_start') expect(line.importDate < start).toBe(true);
        else expect(line.importDate >= start).toBe(true);
      }
    }
  });

  it('parses session ids strictly', () => {
    expect(fixtureKeyFromSessionId('fx_supplier_b')).toBe('supplier_b');
    expect(fixtureKeyFromSessionId('fx_unknown')).toBeNull();
    expect(fixtureKeyFromSessionId('abc')).toBeNull();
  });
});
