import { RuledMeasure } from '@/components/shared/RuledMeasure';
import { SourceBadge } from '@/components/tools/SourceBadge';
import type { LiabilityPreview } from '@/lib/api/schemas';
import { rules } from '@/lib/config/rules';
import { getStatus } from '@/lib/config/status';
import { toolsConfig } from '@/lib/config/tools';
import { formatGBP, formatPercent } from '@/lib/utils/format';

/** Where the in-scope value sits against the threshold, with the reason in words. */
export function ThresholdPosition({ result }: { result: LiabilityPreview }) {
  const { threshold } = result;
  const { thresholdGuidanceBands: bands } = toolsConfig;
  const source = rules.registrationThreshold;
  const label =
    threshold.ratio !== null && threshold.amount !== null && threshold.status
      ? `${formatGBP(threshold.coveredValueGbp)} is ${formatPercent(threshold.ratio)} of the ${formatGBP(threshold.amount)} threshold; status ${getStatus(threshold.status).label}`
      : 'No threshold position to show.';

  return (
    <section aria-labelledby="threshold-title" data-print-card="" className="box">
      <h2 id="threshold-title" className="box-head t-label">
        Threshold position
      </h2>
      <div className="box-body">
        <div className="flex flex-col gap-3">
          <p className="t-figure-lg">
            {formatGBP(threshold.coveredValueGbp)}
            {threshold.amount !== null ? (
              <span className="ml-2 text-base font-normal text-ink-muted">
                of {formatGBP(threshold.amount)}
              </span>
            ) : null}
          </p>
          <RuledMeasure
            ratio={threshold.ratio ?? 0}
            ticks={[bands.watchFrom, bands.approachingFrom]}
            label={label}
            className="my-2 max-w-xl"
          />
          <p className="max-w-prose text-ink-muted">{threshold.reason}</p>
          <p className="text-sm text-ink-subtle">{bands.label}.</p>
          <SourceBadge
            provenance={threshold.provenance}
            sourceTitle={source.sourceTitle}
            sourceUrl={source.sourceUrl}
            sourceDate={source.sourceDate}
          />
        </div>
      </div>
    </section>
  );
}
