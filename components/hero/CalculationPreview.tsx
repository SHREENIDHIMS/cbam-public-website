import type { ReactNode } from 'react';
import { Badge } from '@/components/shared/Badge';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { PROVENANCE } from '@/lib/config/provenance';
import {
  SAMPLE_IMPORTER,
  SAMPLE_LINE,
  SAMPLE_SUPPLIERS,
  computeSampleLine,
} from '@/lib/config/home-sample';
import { formatEmissions, formatGBP, formatIntensity, formatTonnes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface Row {
  label: string;
  value: string;
  note: string;
  badge: ReactNode;
  emphasis?: boolean;
}

const LEGEND = ['official', 'default_value', 'supplier_actual', 'scenario'] as const;

/** "Why this number?": one sample line from customs value to indicative net, each step labelled. */
export function CalculationPreview() {
  const line = SAMPLE_LINE;
  const result = computeSampleLine(line, 'default');
  const actual = computeSampleLine(line, 'actual');
  const own = <Badge tone="neutral">From your upload</Badge>;
  const calculated = <Badge tone="neutral">Calculated</Badge>;

  const rows: Row[] = [
    {
      label: 'Customs value',
      value: formatGBP(line.customsValue),
      note: 'Taken from the customs entry on this line.',
      badge: own,
    },
    {
      label: 'Quantity',
      value: formatTonnes(line.quantityTonnes),
      note: 'Net mass declared for the goods.',
      badge: own,
    },
    {
      label: 'Emissions basis',
      value: `${formatIntensity(line.defaultIntensity)} = ${formatEmissions(result.emissions)}`,
      note: `Default value used because ${SAMPLE_SUPPLIERS.meridian} has not supplied data. Supplier actual data of ${formatIntensity(line.actualIntensity)} would give ${formatEmissions(actual.emissions)}.`,
      badge: <ProvenanceBadge provenance="default_value" />,
    },
    {
      label: 'Rate',
      value: `${formatGBP(line.scenarioRate, { pence: true })} per tCO2e`,
      note: 'An illustrative rate for this sample. It is not an official rate.',
      badge: <ProvenanceBadge provenance="scenario" />,
    },
    {
      label: 'Gross charge',
      value: formatGBP(result.gross, { pence: true }),
      note: `${formatEmissions(result.emissions)} × ${formatGBP(line.scenarioRate, { pence: true })}`,
      badge: calculated,
    },
    {
      label: 'Relief',
      value: `−${formatGBP(result.relief, { pence: true })}`,
      note: `Assumes ${formatGBP(line.scenarioReliefRate, { pence: true })} per tCO2e of carbon price already paid at origin.`,
      badge: <ProvenanceBadge provenance="scenario" />,
    },
    {
      label: 'Indicative net position',
      value: formatGBP(result.net, { pence: true }),
      note: 'Based on the information provided. Changes if supplier actual data arrives.',
      badge: <Badge tone="info">Indicative</Badge>,
      emphasis: true,
    },
  ];

  return (
    <div className="relative">
      <span className="stamp stamp-tilt absolute -top-3.5 right-6 z-10 bg-canvas text-[0.8125rem] text-primary">
        Sample, illustrative
      </span>
      <div className="box overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink px-5 pt-4 pb-3 md:px-7">
          <p className="font-display text-lg font-[720] tracking-[-0.015em] text-ink">
            Workings for one line
          </p>
          <p className="text-sm text-ink-muted">
            {line.description} · {SAMPLE_IMPORTER}
          </p>
        </div>
        <ol className="m-0 list-none p-0">
          {rows.map((row, index) => (
            <li
              key={row.label}
              className={cn(
                'grid grid-cols-1 gap-x-6 gap-y-2 border-b border-line px-5 py-5 last:border-b-0 md:grid-cols-[2rem_10rem_minmax(0,1fr)_9.5rem] md:items-start md:px-7',
                row.emphasis && 'bg-primary-tint',
              )}
            >
              <span aria-hidden="true" className="box-no hidden text-ink-subtle md:inline-grid">
                {index + 1}
              </span>
              <p className="t-label text-ink-subtle md:pt-1">{row.label}</p>
              <div>
                <p
                  className={cn(
                    row.emphasis ? 't-figure-lg' : 't-figure text-lg font-semibold text-ink',
                  )}
                >
                  {row.value}
                </p>
                <p className="mt-1 max-w-prose text-sm text-ink-muted">{row.note}</p>
              </div>
              <div className="md:justify-self-end">{row.badge}</div>
            </li>
          ))}
        </ol>
        <div className="border-t-2 border-ink bg-surface-alt px-5 py-5 text-sm text-ink-muted md:px-7">
          <p className="t-label text-ink">Four kinds of value, never blurred together</p>
          <ul className="m-0 mt-3 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {LEGEND.map((key) => (
              <li key={key} className="flex flex-col items-start gap-1.5">
                <ProvenanceBadge provenance={key} />
                <span>{PROVENANCE[key].meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
