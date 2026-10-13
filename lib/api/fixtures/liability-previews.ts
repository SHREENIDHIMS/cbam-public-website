import 'server-only';
import { getProvenance } from '@/lib/config/provenance';
import { rules } from '@/lib/config/rules';
import type { SectorKey } from '@/lib/config/rules-schema';
import {
  SCENARIO_ASSUMPTIONS,
  SUPPLIER_ACTUALS,
  SUPPLIER_ACTUAL_NOTE,
  type ScenarioAssumption,
} from '@/lib/config/scenario-assumptions';
import { toolsConfig } from '@/lib/config/tools';
import { classifyRatio } from '@/lib/tools/threshold';
import { round2, roundMoney } from '@/lib/tools/money';
import { formatDate, formatGBP, formatPercent } from '@/lib/utils/format';
import {
  liabilityPreviewSchema,
  type ClientSummary,
  type FixtureKey,
  type LiabilityLine,
  type LiabilityPreview,
  type SupplierExposure,
} from '../schemas';
import { FIXTURE_LINES, type FixtureLine } from './liability-lines';

/**
 * Arithmetic on committed fixture lines only, using scenario assumptions. It never runs on a
 * visitor's rows: an unrecognised file gets the Northstar lines, labelled as a demo.
 */

const SAMPLE_NOTE = 'Sample result pre-computed for this sample file.';
const DEMO_NOTE = 'Demo result: not calculated from your file.';

const DEFAULT_INTENSITY: Partial<Record<SectorKey, ScenarioAssumption>> = {
  iron_steel: SCENARIO_ASSUMPTIONS.defaultIntensityIronSteel,
  aluminium: SCENARIO_ASSUMPTIONS.defaultIntensityAluminium,
  cement: SCENARIO_ASSUMPTIONS.defaultIntensityCement,
};

const SCOPE_LABELS = {
  in_scope: 'In scope in this demo',
  out_of_scope: 'Out of scope in this demo',
  before_start: 'Before the CBAM start date',
} as const;

const UNKNOWN_SUPPLIER = 'Supplier not given';

export const FIXTURE_SESSION_PATTERN = /^fx_(northstar|meridian|supplier_b|broker_export|demo)$/;

export function fixtureKeyFromSessionId(sessionId: string): FixtureKey | null {
  const match = FIXTURE_SESSION_PATTERN.exec(sessionId);
  return match ? (match[1] as FixtureKey) : null;
}

function sectorLabel(sector: SectorKey): string {
  return rules.sectors.value?.find((entry) => entry.key === sector)?.label ?? sector;
}

function supplierActual(supplier: string | null, sector: SectorKey | null): number | null {
  if (!supplier || !sector) return null;
  const entry = (SUPPLIER_ACTUALS as Record<string, Partial<Record<string, number>>>)[supplier];
  return entry?.[sector] ?? null;
}

function buildLine(line: FixtureLine): LiabilityLine {
  const startDate = rules.startDate.value;
  const base = {
    lineId: `L${line.rowNumber}`,
    rowNumber: line.rowNumber,
    importDate: line.importDate,
    commodityCode: line.commodityCode,
    description: line.description,
    sector: line.sector,
    originCountry: line.originCountry,
    supplier: line.supplier,
    massTonnes: Math.round((line.netMassKg / 1000) * 1e6) / 1e6,
    customsValueGbp: line.customsValueGbp,
    scope: line.scope,
  };

  if (line.scope === 'out_of_scope') {
    return {
      ...base,
      scopeReason: 'Scrap heading treated as outside CBAM in this demo (fixture decision).',
      emissionsBasis: null,
      intensity: null,
      intensityProvenance: null,
      embeddedEmissions: null,
      grossGbp: null,
      reliefGbp: null,
      netGbp: null,
    };
  }
  if (line.scope === 'before_start') {
    return {
      ...base,
      scopeReason: `Import date is before the CBAM start date in the rules snapshot (${
        startDate ? formatDate(startDate) : 'to be confirmed'
      }, ${rules.startDate.status}).`,
      emissionsBasis: null,
      intensity: null,
      intensityProvenance: null,
      embeddedEmissions: null,
      grossGbp: null,
      reliefGbp: null,
      netGbp: null,
    };
  }

  const sector = line.sector as SectorKey;
  const actual =
    line.supplierDeclaration === 'verified' ? supplierActual(line.supplier, sector) : null;
  const basis = actual !== null ? 'supplier_actual' : 'default_value';
  const intensity = actual ?? DEFAULT_INTENSITY[sector]?.value ?? 0;
  const emissions = round2(base.massTonnes * intensity);
  const gross = roundMoney(emissions * SCENARIO_ASSUMPTIONS.rate.value);
  const relief =
    basis === 'supplier_actual' ? roundMoney(emissions * SCENARIO_ASSUMPTIONS.relief.value) : 0;
  return {
    ...base,
    scopeReason: `Commodity heading ${line.commodityCode.slice(0, 4)} is listed under ${sectorLabel(
      sector,
    )} in this demo (fixture decision; scope is not resolved by the public site and the commodity code decides scope in the legislation).`,
    emissionsBasis: basis,
    intensity,
    // A supplier actual is the supplier's own figure; a default is a scenario value in this demo.
    intensityProvenance: basis === 'supplier_actual' ? 'supplier_actual' : 'scenario',
    embeddedEmissions: emissions,
    grossGbp: gross,
    reliefGbp: relief,
    netGbp: roundMoney(gross - relief),
  };
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function buildSuppliers(lines: readonly LiabilityLine[]): SupplierExposure[] {
  const names = [...new Set(lines.map((line) => line.supplier ?? UNKNOWN_SUPPLIER))];
  const totalNet = sum(lines.map((line) => line.netGbp ?? 0));

  const rows = names.map((name) => {
    const own = lines.filter((line) => (line.supplier ?? UNKNOWN_SUPPLIER) === name);
    const covered = own.filter((line) => line.scope === 'in_scope');
    const bases = new Set(covered.map((line) => line.emissionsBasis));
    const net = roundMoney(sum(covered.map((line) => line.netGbp ?? 0)));
    return {
      supplier: name,
      coveredLines: covered.length,
      otherLines: own.length - covered.length,
      coveredValueGbp: roundMoney(sum(covered.map((line) => line.customsValueGbp))),
      netGbp: net,
      shareOfNet: totalNet > 0 ? Math.min(1, Math.max(0, net / totalNet)) : 0,
      basis:
        covered.length === 0
          ? ('none' as const)
          : bases.size > 1
            ? ('mixed' as const)
            : bases.has('supplier_actual')
              ? ('supplier_actual' as const)
              : ('default_value' as const),
      missingData: covered.some((line) => line.emissionsBasis === 'default_value'),
    };
  });

  rows.sort((a, b) => {
    if ((a.basis === 'none') !== (b.basis === 'none')) return a.basis === 'none' ? 1 : -1;
    return b.netGbp - a.netGbp || a.supplier.localeCompare(b.supplier, 'en-GB');
  });
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function buildFixturePreview(
  key: FixtureKey,
  visitorCounts: ClientSummary | null = null,
): LiabilityPreview {
  const lines = FIXTURE_LINES[key].map(buildLine);
  const covered = lines.filter((line) => line.scope === 'in_scope');
  const thresholdAmount = rules.registrationThreshold.value?.amount ?? null;
  const bands = toolsConfig.thresholdGuidanceBands;

  const coveredValue = roundMoney(sum(covered.map((line) => line.customsValueGbp)));
  const ratio = thresholdAmount !== null ? coveredValue / thresholdAmount : null;
  const thresholdStatus = ratio !== null && covered.length > 0 ? classifyRatio(ratio, bands) : null;
  const dates = covered.map((line) => line.importDate).sort();
  const periodFrom = dates[0] ?? null;
  const periodTo = dates[dates.length - 1] ?? null;

  const status =
    thresholdStatus === null
      ? ('needs_data' as const)
      : thresholdStatus === 'triggered' || thresholdStatus === 'approaching'
        ? thresholdStatus
        : ('below' as const);

  const thresholdReason =
    thresholdAmount === null || ratio === null || periodFrom === null || periodTo === null
      ? 'The registration threshold is to be confirmed, or no lines in this file are in scope, so no position can be shown.'
      : `In-scope imports in this file from ${formatDate(periodFrom)} to ${formatDate(periodTo)} total ${formatGBP(
          coveredValue,
        )}, ${formatPercent(ratio)} of the ${formatGBP(thresholdAmount)} threshold (${getProvenance(rules.registrationThreshold.status).label}). The threshold applies to a rolling 12-month period; this file may cover a shorter one.`;

  const suppliers = buildSuppliers(lines);
  const usedSectors = [
    ...new Set(
      covered.map((line) => line.sector).filter((sector): sector is SectorKey => !!sector),
    ),
  ];
  const actualsUsed = covered.filter((line) => line.emissionsBasis === 'supplier_actual');
  const missingSuppliers = suppliers.filter((supplier) => supplier.missingData);

  const assumptions = [
    SCENARIO_ASSUMPTIONS.rate,
    SCENARIO_ASSUMPTIONS.relief,
    ...usedSectors.flatMap((sector) => {
      const entry = DEFAULT_INTENSITY[sector];
      return entry ? [entry] : [];
    }),
  ].map((entry) => ({
    key: entry.key,
    label: entry.label,
    value: entry.value,
    unit: entry.unit,
    provenance: entry.provenance,
    note: entry.note,
  }));
  const actualAssumptions = [
    ...new Map(
      actualsUsed.map((line) => [
        `${line.supplier}|${line.sector}`,
        {
          key: `supplierActual.${line.supplier}.${line.sector}`,
          label: `${line.supplier}, ${sectorLabel(line.sector as SectorKey)}: supplier actual intensity`,
          value: line.intensity ?? 0,
          unit: 'tCO2e per tonne',
          provenance: 'supplier_actual' as const,
          note: SUPPLIER_ACTUAL_NOTE,
        },
      ]),
    ).values(),
  ];

  const startDate = rules.startDate;
  const threshold = rules.registrationThreshold;
  const sectorsRule = rules.sectors;

  const preview: LiabilityPreview = {
    rulesVersion: rules.rulesVersion,
    dataSource: 'fixture',
    sessionId: `fx_${key}`,
    processingStatus: 'complete',
    isDemo: key === 'demo',
    fixtureKey: key,
    sampleNote: key === 'demo' ? DEMO_NOTE : SAMPLE_NOTE,
    status,
    rowCounts: {
      received: lines.length,
      inScope: covered.length,
      outOfScope: lines.filter((line) => line.scope === 'out_of_scope').length,
      beforeStart: lines.filter((line) => line.scope === 'before_start').length,
    },
    visitorCounts: key === 'demo' ? visitorCounts : null,
    summary: {
      coveredLines: covered.length,
      coveredValueGbp: coveredValue,
      coveredMassTonnes: Math.round(sum(covered.map((line) => line.massTonnes)) * 1000) / 1000,
      embeddedEmissions: round2(sum(covered.map((line) => line.embeddedEmissions ?? 0))),
      grossGbp: roundMoney(sum(covered.map((line) => line.grossGbp ?? 0))),
      reliefGbp: roundMoney(sum(covered.map((line) => line.reliefGbp ?? 0))),
      netGbp: roundMoney(sum(covered.map((line) => line.netGbp ?? 0))),
      provenance: 'scenario',
    },
    threshold: {
      amount: thresholdAmount,
      provenance: threshold.status,
      coveredValueGbp: coveredValue,
      ratio,
      status: thresholdStatus,
      periodFrom,
      periodTo,
      reason: thresholdReason,
    },
    scopeReasons: (['in_scope', 'out_of_scope', 'before_start'] as const).map((scope) => ({
      scope,
      label: SCOPE_LABELS[scope],
      count: lines.filter((line) => line.scope === scope).length,
    })),
    lines,
    suppliers,
    methodology: {
      inputs: [
        `${lines.length} rows received after your own checks in the browser. Rows that needed review were not sent.`,
        'Fields used: commodity code, import date, net mass, customs value, origin country, supplier, description and supplier emissions data status.',
        'Net mass is converted to tonnes. Customs values are taken as GBP.',
      ],
      formula: [
        {
          step: 'Scope',
          text: 'Each line is matched to a sector by its commodity code, or marked out of scope or before the start date. In this demo that decision is fixed for each sample line. It is not made by the legislation.',
        },
        {
          step: 'Embedded emissions',
          text: 'Mass in tonnes multiplied by an emissions intensity in tCO2e per tonne. The intensity is a supplier actual where a verified declaration is present, otherwise a scenario default.',
        },
        {
          step: 'Gross liability',
          text: 'Embedded emissions multiplied by the scenario carbon rate.',
        },
        {
          step: 'Relief and net position',
          text: 'Relief is embedded emissions multiplied by the scenario relief per tCO2e, applied only to lines that use supplier actual data. Net indicative position is gross liability minus relief.',
        },
      ],
      assumptions: [...assumptions, ...actualAssumptions],
      sources: [startDate, threshold, sectorsRule].map((rule) => ({
        title: rule.sourceTitle,
        url: rule.sourceUrl,
        provenance: rule.status,
        date: rule.sourceDate,
      })),
      missing: [
        'No official CBAM rate is in this rules snapshot, so a scenario rate is used. The indicative liability is not an official figure.',
        missingSuppliers.length > 0
          ? `Suppliers without emissions data: ${missingSuppliers
              .map((supplier) => supplier.supplier)
              .join(', ')}. Scenario default intensities were used for their lines.`
          : 'Every covered line uses supplier emissions data.',
        'Scope is decided per sample line in this demo, not by the legislation. Check the official goods lists.',
      ],
    },
  };
  return liabilityPreviewSchema.parse(preview);
}

export function sampleNoteFor(key: FixtureKey): string {
  return key === 'demo' ? DEMO_NOTE : SAMPLE_NOTE;
}
