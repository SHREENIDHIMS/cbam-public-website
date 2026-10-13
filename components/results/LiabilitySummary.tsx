import { ScenarioBadge } from '@/components/tools/ScenarioBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { LiabilityPreview } from '@/lib/api/schemas';
import { formatGBPExact, formatInteger, formatPercent, formatTonnes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { pence } from './money';

const field = 'flex min-w-0 flex-col gap-1 border-line p-4 md:p-5';
const figure = 't-figure m-0 text-[1.625rem] leading-tight font-semibold text-ink';

/** Five headline figures as boxed fields on one form. The liability field carries the Scenario stamp. */
export function LiabilitySummary({ result }: { result: LiabilityPreview }) {
  const { summary, threshold } = result;
  return (
    <section aria-labelledby="summary-title" className="box" data-print-card="">
      <h2 id="summary-title" className="box-head t-label">
        Summary of this file
      </h2>
      <dl className="m-0 grid grid-cols-2 lg:grid-cols-5">
        <div className={cn(field, 'border-r border-b lg:border-b-0')}>
          <dt className="t-label text-ink-subtle">Covered lines</dt>
          <dd className={figure}>{formatInteger(summary.coveredLines)}</dd>
          <dd className="m-0 text-xs text-ink-muted">
            of {formatInteger(result.rowCounts.received)} received
          </dd>
        </div>
        <div className={cn(field, 'border-b lg:border-r lg:border-b-0')}>
          <dt className="t-label text-ink-subtle">Covered import value</dt>
          <dd className={figure}>{formatGBPExact(summary.coveredValueGbp)}</dd>
          <dd className="m-0 text-xs text-ink-muted">Customs value, in-scope lines</dd>
        </div>
        <div className={cn(field, 'border-r border-b lg:border-b-0')}>
          <dt className="t-label text-ink-subtle">Covered tonnes</dt>
          <dd className={figure}>{formatTonnes(summary.coveredMassTonnes)}</dd>
          <dd className="m-0 text-xs text-ink-muted">Net mass, in-scope lines</dd>
        </div>
        <div className={cn(field, 'border-b bg-primary-tint lg:border-r lg:border-b-0')}>
          <dt className="t-label flex flex-wrap items-center gap-2 text-ink">
            Indicative liability <ScenarioBadge />
          </dt>
          <dd className={figure}>{pence(summary.netGbp)}</dd>
          <dd className="m-0 text-xs text-ink-muted">
            Gross {pence(summary.grossGbp)}, relief {pence(summary.reliefGbp)}
          </dd>
        </div>
        <div className={cn(field, 'col-span-2 lg:col-span-1')}>
          <dt className="t-label text-ink-subtle">Threshold position</dt>
          <dd className="m-0 mt-1">
            <StatusBadge status={result.status} />
          </dd>
          <dd className="t-figure m-0 text-xs text-ink-muted">
            {threshold.ratio === null
              ? 'To be confirmed'
              : `${formatPercent(threshold.ratio)} of the threshold`}
          </dd>
        </div>
      </dl>
    </section>
  );
}
