import { CircleHelp } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SourceBadge } from '@/components/tools/SourceBadge';
import { ThresholdGauge } from '@/components/tools/ThresholdGauge';
import type { Provenance } from '@/lib/config/provenance';
import { getStatus, type ThresholdStatus } from '@/lib/config/status';
import type { ForwardBasis } from '@/lib/tools/threshold';
import { formatGBP, formatPercent } from '@/lib/utils/format';
import { DemoDataIndicator } from './DemoDataIndicator';

export interface ThresholdViewProps {
  amount: number | null;
  ratio: number | null;
  status: ThresholdStatus | null;
  basis: 'entered' | ForwardBasis;
  explanation: string;
}

export interface ThresholdResultProps {
  id: string;
  title: string;
  testDescription: string | null;
  source: { provenance: Provenance; title: string; url: string; date: string | null };
  thresholdAmount: number;
  view: ThresholdViewProps;
  gauge: { maxRatio: number; watchFrom: number; approachingFrom: number };
  dataSource: 'fixture' | 'live';
}

export function describeGauge(view: ThresholdViewProps, thresholdAmount: number): string {
  if (view.status === null || view.amount === null || view.ratio === null) {
    return 'Not assessed yet. No gauge reading.';
  }
  return `${formatGBP(view.amount)} is ${formatPercent(view.ratio)} of the ${formatGBP(thresholdAmount)} threshold; status ${getStatus(view.status).label}`;
}

/** One threshold test: gauge, status, figures, explanation and the test's source. Props only. */
export function ThresholdResult({
  id,
  title,
  testDescription,
  source,
  thresholdAmount,
  view,
  gauge,
  dataSource,
}: ThresholdResultProps) {
  const aboveScale = view.ratio !== null && view.ratio > gauge.maxRatio;
  const headingId = `${id}-title`;

  return (
    <section
      aria-labelledby={headingId}
      data-print-card=""
      className="rounded-sm border border-line bg-surface p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3 id={headingId} className="t-title">
          {title}
        </h3>
        <DemoDataIndicator dataSource={dataSource} />
      </div>

      <div className="mt-5">
        <ThresholdGauge
          ratio={view.ratio}
          status={view.status}
          maxRatio={gauge.maxRatio}
          watchFrom={gauge.watchFrom}
          approachingFrom={gauge.approachingFrom}
          label={describeGauge(view, thresholdAmount)}
        />
      </div>

      <div className="mt-2 flex flex-col items-center gap-2 text-center">
        <p className="text-3xl leading-tight font-semibold text-ink tabular-nums">
          {view.amount === null ? 'Not assessed' : formatGBP(view.amount)}
        </p>
        {view.ratio !== null ? (
          <p className="text-sm text-ink-muted tabular-nums">
            {formatPercent(view.ratio)} of the {formatGBP(thresholdAmount)} threshold
            {aboveScale ? ' · Above scale' : ''}
          </p>
        ) : null}
        {view.status ? (
          <StatusBadge status={view.status} />
        ) : (
          <Badge tone="neutral" icon={<CircleHelp aria-hidden="true" className="size-4" />}>
            Not assessed
          </Badge>
        )}
      </div>

      <p className="mt-5 text-ink-muted">{view.explanation}</p>

      <div className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
        {testDescription ? <p>{testDescription}</p> : null}
        <p className="mt-3">
          <SourceBadge
            provenance={source.provenance}
            sourceTitle={source.title}
            sourceUrl={source.url}
            sourceDate={source.date}
          />
        </p>
      </div>
    </section>
  );
}
