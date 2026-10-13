import type { Route } from 'next';
import { FlaskConical } from 'lucide-react';
import { Alert } from '@/components/shared/Alert';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { DemoDataIndicator } from '@/components/results/DemoDataIndicator';
import type { LiabilityPreview } from '@/lib/api/schemas';
import { formatInteger } from '@/lib/utils/format';

/** Step 5 result: how many lines are in scope, with the reason for each group. */
export function ScopeSummary({ result }: { result: LiabilityPreview }) {
  const { rowCounts, scopeReasons, visitorCounts } = result;
  const tiles = [
    { label: 'In scope', value: rowCounts.inScope, scope: 'in_scope' },
    { label: 'Out of scope', value: rowCounts.outOfScope, scope: 'out_of_scope' },
    { label: 'Before the start date', value: rowCounts.beforeStart, scope: 'before_start' },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <DemoDataIndicator dataSource={result.dataSource} />
      </div>

      {result.isDemo ? (
        <Alert tone="watch" title="Demo result: not calculated from your file">
          <span className="flex items-start gap-2">
            <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              This demo does not calculate from your rows. The result that follows is a worked
              sample so you can see the full layout.
              {visitorCounts
                ? ` Your file had ${formatInteger(visitorCounts.included)} of ${formatInteger(visitorCounts.rowsFound)} rows ready.`
                : ''}
            </span>
          </span>
        </Alert>
      ) : result.sampleNote ? (
        <Alert tone="info">{result.sampleNote}</Alert>
      ) : null}

      <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => {
          const reason = scopeReasons.find((entry) => entry.scope === tile.scope);
          return (
            <div key={tile.scope} className="rounded-md border border-line bg-surface px-4 py-4">
              <dt className="text-sm font-medium text-ink-subtle">{tile.label}</dt>
              <dd className="t-figure-lg m-0 mt-1">{formatInteger(tile.value)}</dd>
              {reason ? <dd className="m-0 mt-1 text-xs text-ink-muted">{reason.label}</dd> : null}
            </div>
          );
        })}
      </dl>

      <div>
        <ButtonLink
          href={`/liability-preview/result/${result.sessionId}` as Route}
          size="lg"
          className="w-full sm:w-auto"
        >
          View the line-by-line preview
        </ButtonLink>
      </div>
    </div>
  );
}
