import { CircleCheck, CircleDashed, Clock } from 'lucide-react';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { RuledMeasure } from '@/components/shared/RuledMeasure';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { rules } from '@/lib/config/rules';
import {
  SAMPLE_EVIDENCE,
  SAMPLE_IMPORTER,
  SAMPLE_LABEL,
  SAMPLE_SCENARIO_RANGE,
  SAMPLE_SUPPLIER_COVERAGE,
  SAMPLE_TWELVE_MONTH_VALUE,
  sampleCoverage,
  sampleThresholdStatus,
  type SupplierState,
} from '@/lib/config/home-sample';
import { toolsConfig } from '@/lib/config/tools';
import { cn } from '@/lib/utils/cn';
import { formatDateShort, formatGBP, formatGBPRange, formatPercent } from '@/lib/utils/format';

const SUPPLIER_STATE: Record<
  SupplierState,
  { label: string; icon: typeof CircleCheck; bar: string }
> = {
  verified: { label: 'Data verified', icon: CircleCheck, bar: 'bg-primary' },
  requested: { label: 'Requested', icon: Clock, bar: 'bg-secondary' },
  missing: {
    label: 'Emissions missing',
    icon: CircleDashed,
    bar: 'bg-[repeating-linear-gradient(135deg,var(--cc-line-strong)_0_2px,transparent_2px_6px)]',
  },
};

const fieldClass = 'min-w-0 p-5';
const fieldLabelClass = 't-label text-ink-subtle';

/**
 * Hero compliance snapshot, drawn as a declaration form with four boxed fields. A custom marketing
 * visual, not a screenshot. Every figure is fictional and labelled; the threshold is read from the
 * rules config.
 */
export function ProductPreview({ className }: { className?: string }) {
  const threshold = rules.registrationThreshold.value;
  const ratio = threshold ? SAMPLE_TWELVE_MONTH_VALUE / threshold.amount : 0;
  const status = threshold ? sampleThresholdStatus(threshold.amount) : 'needs_data';
  const { watchFrom, approachingFrom } = toolsConfig.thresholdGuidanceBands;
  const coverage = sampleCoverage();
  const gaugeLabel = threshold
    ? `Sample threshold gauge: ${formatGBP(SAMPLE_TWELVE_MONTH_VALUE)} of ${formatGBP(threshold.amount)}, ${formatPercent(ratio)} used.`
    : 'Sample threshold gauge. The threshold is to be confirmed.';

  return (
    <figure className={cn('m-0', className)} aria-label="Sample compliance snapshot">
      <div className="relative">
        <span className="stamp stamp-tilt stamp-land absolute -top-3.5 right-5 z-10 bg-canvas text-[0.8125rem] text-primary">
          Sample, illustrative
        </span>
        <div className="box overflow-hidden">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink px-5 pt-4 pb-3">
            <p className="font-display text-lg font-[720] tracking-[-0.015em] text-ink">
              Compliance snapshot
            </p>
            <p className="text-sm text-ink-muted">{SAMPLE_IMPORTER}</p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <section aria-labelledby="pp-threshold" className={fieldClass}>
              <h2 id="pp-threshold" className={fieldLabelClass}>
                Registration threshold
              </h2>
              <div className="mt-4 flex flex-col items-start gap-1">
                <p className="t-figure-lg">{formatGBP(SAMPLE_TWELVE_MONTH_VALUE)}</p>
                <p className="t-figure text-[0.8125rem] text-ink-muted">
                  {threshold
                    ? `of ${formatGBP(threshold.amount)} over ${threshold.period}`
                    : 'Threshold to be confirmed'}
                </p>
                <RuledMeasure
                  ratio={ratio}
                  ticks={[watchFrom, approachingFrom]}
                  label={gaugeLabel}
                  className="mt-4"
                />
                <div className="mt-3">
                  <StatusBadge status={status} />
                </div>
              </div>
            </section>

            <section aria-labelledby="pp-liability" className={fieldClass}>
              <h2 id="pp-liability" className={fieldLabelClass}>
                Indicative liability
              </h2>
              <p className="t-figure-lg mt-4 text-[clamp(1.5rem,1.25rem+0.9vw,2rem)]">
                {formatGBPRange(SAMPLE_SCENARIO_RANGE.low, SAMPLE_SCENARIO_RANGE.high)}
              </p>
              <p className="mt-3 text-sm text-ink-muted">
                Lower end uses supplier actual data; upper end uses default values.
              </p>
              <div className="mt-4">
                <ProvenanceBadge provenance="scenario" />
              </div>
              <p className="mt-3 text-sm text-ink-subtle">
                Rate and relief are scenario assumptions in this sample.
              </p>
            </section>
          </div>

          <div className="grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <section aria-labelledby="pp-coverage" className={fieldClass}>
              <h2 id="pp-coverage" className={fieldLabelClass}>
                Supplier coverage
              </h2>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="t-figure-lg">{formatPercent(coverage)}</span>
                <span className="text-sm text-ink-muted">of value covered</span>
              </p>
              <div className="mt-4 flex h-2 w-full gap-px" aria-hidden="true">
                {SAMPLE_SUPPLIER_COVERAGE.map((supplier) => (
                  <span
                    key={supplier.name}
                    className={cn('bar-grow h-full', SUPPLIER_STATE[supplier.state].bar)}
                    style={{ width: `${supplier.valueShare * 100}%` }}
                  />
                ))}
              </div>
              <ul className="m-0 mt-4 list-none space-y-2 p-0">
                {SAMPLE_SUPPLIER_COVERAGE.map((supplier) => {
                  const state = SUPPLIER_STATE[supplier.state];
                  const Icon = state.icon;
                  return (
                    <li key={supplier.name} className="flex items-start gap-2 text-sm">
                      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                      <span className="flex flex-col leading-snug">
                        <span className="font-semibold text-ink">{supplier.name}</span>
                        <span className="text-ink-muted">{state.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="pp-evidence" className={fieldClass}>
              <h2 id="pp-evidence" className={fieldLabelClass}>
                Evidence readiness
              </h2>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="t-figure-lg">
                  {SAMPLE_EVIDENCE.ready}/{SAMPLE_EVIDENCE.total}
                </span>
                <span className="text-sm text-ink-muted">items ready</span>
              </p>
              <div className="mt-4 grid grid-cols-8 gap-1" aria-hidden="true">
                {Array.from({ length: SAMPLE_EVIDENCE.total }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-3',
                      index < SAMPLE_EVIDENCE.ready ? 'bg-primary' : 'border border-line-strong',
                    )}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                {SAMPLE_EVIDENCE.total - SAMPLE_EVIDENCE.ready} items still need evidence before the
                position is return-ready.
              </p>
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line bg-surface-alt px-5 py-3 text-sm text-ink-muted">
            <span className="t-label text-ink-subtle">Rules snapshot</span>
            <ProvenanceBadge provenance={rules.startDate.status} />
            <span className="t-figure text-[0.8125rem]">
              Reviewed {formatDateShort(rules.reviewedAt)}
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-sm text-ink-subtle">{SAMPLE_LABEL}</figcaption>
    </figure>
  );
}
