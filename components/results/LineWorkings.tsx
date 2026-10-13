import type { ReactNode } from 'react';
import type { LiabilityLine, LiabilityPreview } from '@/lib/api/schemas';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { formatEmissionsExact, formatIntensity, formatTonnesPrecise } from '@/lib/utils/format';
import { formatAssumption, pence } from './money';
import { OpenOnHash } from './OpenOnHash';

function Step({ children }: { children: ReactNode }) {
  return <li className="rounded-sm bg-surface-alt px-3 py-2 tabular-nums">{children}</li>;
}

function Workings({
  line,
  rate,
  relief,
}: {
  line: LiabilityLine;
  rate: { value: number; unit: string };
  relief: { value: number; unit: string };
}) {
  if (
    line.scope !== 'in_scope' ||
    line.intensity === null ||
    line.embeddedEmissions === null ||
    line.grossGbp === null ||
    line.netGbp === null
  ) {
    return (
      <p className="text-ink-muted">{line.scopeReason} No amount is calculated for this line.</p>
    );
  }
  const actual = line.emissionsBasis === 'supplier_actual';
  return (
    <div className="flex flex-col gap-3">
      <p className="text-ink-muted">{line.scopeReason}</p>
      <ol className="m-0 flex list-none flex-col gap-2 p-0 text-ink">
        <Step>
          {formatTonnesPrecise(line.massTonnes)} × {formatIntensity(line.intensity)}{' '}
          <span className="inline-block align-middle">
            <ProvenanceBadge provenance={actual ? 'supplier_actual' : 'scenario'} />
          </span>{' '}
          = <strong>{formatEmissionsExact(line.embeddedEmissions)}</strong>
        </Step>
        <Step>
          {formatEmissionsExact(line.embeddedEmissions)} × {formatAssumption(rate.value, rate.unit)}{' '}
          <span className="inline-block align-middle">
            <ProvenanceBadge provenance="scenario" />
          </span>{' '}
          = <strong>{pence(line.grossGbp)}</strong> gross
        </Step>
        {actual && line.reliefGbp !== null ? (
          <Step>
            Relief: {formatEmissionsExact(line.embeddedEmissions)} ×{' '}
            {formatAssumption(relief.value, relief.unit)}{' '}
            <span className="inline-block align-middle">
              <ProvenanceBadge provenance="scenario" />
            </span>{' '}
            = <strong>{pence(line.reliefGbp)}</strong>
          </Step>
        ) : (
          <Step>No relief: relief applies only to lines with supplier emissions data.</Step>
        )}
        <Step>
          Net indicative position = <strong>{pence(line.netGbp)}</strong>
        </Step>
      </ol>
    </div>
  );
}

/** One native details element per line, so every value can be traced. Works without scripts. */
export function LineWorkings({ result }: { result: LiabilityPreview }) {
  const rate = result.methodology.assumptions.find((entry) => entry.key === 'rate');
  const relief = result.methodology.assumptions.find((entry) => entry.key === 'relief');
  if (!rate || !relief) return null;
  return (
    <section aria-labelledby="workings-title" className="flex flex-col gap-3">
      <OpenOnHash />
      <h2 id="workings-title" className="t-title">
        Workings for each line
      </h2>
      <p className="max-w-prose text-ink-muted">
        Open a line to see how its figures were reached. Selecting a commodity code in the table
        jumps here.
      </p>
      <div className="ledger">
        {result.lines.map((line) => (
          <details key={line.lineId} id={`line-${line.lineId}`} className="group open:bg-surface">
            <summary className="flex min-h-12 cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 py-3 text-ink hover:text-primary">
              <span className="font-medium tabular-nums">
                Row {line.rowNumber} · {line.commodityCode}
                {line.description ? (
                  <span className="font-normal text-ink-muted"> · {line.description}</span>
                ) : null}
              </span>
              <span className="t-figure text-sm text-ink-subtle">
                {line.netGbp === null ? 'Not calculated' : pence(line.netGbp)}
              </span>
            </summary>
            <div className="border-t border-line px-1 py-4 text-sm">
              <Workings line={line} rate={rate} relief={relief} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
