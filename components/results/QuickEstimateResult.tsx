import type { Route } from 'next';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/shared/Badge';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { QuickEstimateInput, QuickEstimateResult as Result } from '@/lib/api/schemas';
import { getStatus } from '@/lib/config/status';
import { getValueBand, toolsConfig } from '@/lib/config/tools';
import { formatGBP, formatGBPRange } from '@/lib/utils/format';
import { DemoDataIndicator } from './DemoDataIndicator';
import { PrintButton } from './PrintButton';
import { ResultNotice } from './ResultNotice';
import { StaleRulesNotice } from './StaleRulesNotice';

interface QuickEstimateResultProps {
  result: Result;
  input: QuickEstimateInput;
  sectors: ReadonlyArray<{ key: string; label: string }>;
  /** Link back to the wizard with the answers filled in. */
  changeHref: Route;
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = `qe-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <section aria-labelledby={id} data-print-card="" className={`box ${className ?? ''}`}>
      <h2 id={id} className="box-head t-label">
        {title}
      </h2>
      <div className="box-body">{children}</div>
    </section>
  );
}

function sectorLabel(key: string, sectors: ReadonlyArray<{ key: string; label: string }>): string {
  if (key === 'unsure') return 'Not sure';
  return sectors.find((sector) => sector.key === key)?.label ?? key;
}

/** Server-rendered quick estimate result. Shows its inputs, reasons, confidence and next steps. */
export function QuickEstimateResult({
  result,
  input,
  sectors,
  changeHref,
}: QuickEstimateResultProps) {
  const status = getStatus(result.status);
  const { quickEstimate, nextActionRoutes } = toolsConfig;
  const band = getValueBand(input.value);
  const { low, high } = result.valueRange;

  const origins = input.origins
    .map(
      (origin) => quickEstimate.originGroups.find((group) => group.key === origin)?.label ?? origin,
    )
    .join(', ');
  const supplier =
    quickEstimate.supplierBands.find((candidate) => candidate.key === input.suppliers)?.label ??
    input.suppliers;
  const large =
    quickEstimate.largeShipmentOptions.find((option) => option.key === input.large)?.label ??
    input.large;
  const sectorText = input.sectors.map((key) => sectorLabel(key, sectors)).join(', ');

  const { selected, main, unsure } = result.sectorExposure;
  const mainSector = main
    ? sectorLabel(main, sectors)
    : selected.length > 1
      ? `Several sectors: ${selected.map((key) => sectorLabel(key, sectors)).join(', ')}`
      : 'We cannot name one yet';
  const mainNote = main
    ? 'The only sector you selected.'
    : selected.length > 1
      ? 'A quick estimate does not rank sectors. Customs data would show which one matters most.'
      : unsure
        ? 'You were not sure which sectors apply.'
        : '';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={result.status} />
          <DemoDataIndicator dataSource={result.dataSource} />
        </div>
        <h1 id="result-title" className="t-chapter mt-5 max-w-[24ch]">
          {status.resultHeadline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          A quick estimate from broad ranges. It shows where you probably stand and what would
          sharpen the picture.
        </p>
      </div>

      <StaleRulesNotice rulesVersion={result.rulesVersion} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card title="Why">
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-ink">
            {result.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Card>

        <Card title="Confidence">
          <p>
            <Badge tone={result.confidence.level === 'medium' ? 'info' : 'watch'}>
              {result.confidence.level === 'medium' ? 'Medium confidence' : 'Low confidence'}
            </Badge>
          </p>
          <ul className="m-0 mt-3 flex list-disc flex-col gap-2 pl-5 text-ink-muted">
            {result.confidence.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Card>

        <Card title="Threshold">
          {result.threshold.amount === null ? (
            <p className="t-title">To be confirmed</p>
          ) : (
            <p className="t-figure-lg">{formatGBP(result.threshold.amount)}</p>
          )}
          <p className="mt-2">
            <ProvenanceBadge provenance={result.threshold.provenance} />
          </p>
          <p className="mt-3 text-ink-muted">
            {low !== null
              ? high !== null
                ? `Your yearly range: ${formatGBPRange(low, high)}.`
                : `Your yearly range: over ${formatGBP(low)}.`
              : 'You did not give a yearly range.'}
          </p>
        </Card>

        <Card title="Main exposure sector">
          <p className="t-title">{mainSector}</p>
          {mainNote ? <p className="mt-2 text-ink-muted">{mainNote}</p> : null}
        </Card>

        <Card title="What you told us" className="md:col-span-2">
          <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Yearly value', band.label],
              ['Sectors', sectorText],
              ['Origins', origins],
              ['Suppliers', supplier],
              ['Very large shipments', large],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="text-sm text-ink-subtle">{term}</dt>
                <dd className="m-0 font-semibold text-ink">{detail}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="What to do next" className="md:col-span-2">
          <ul className="m-0 flex list-none flex-col gap-3 p-0 sm:flex-row sm:flex-wrap">
            {result.nextActions.map((action, index) => (
              <li key={action.key} className="sm:flex-none">
                <ButtonLink
                  href={nextActionRoutes[action.key]}
                  variant={index === 0 ? 'primary' : 'secondary'}
                  className="w-full sm:w-auto"
                >
                  {action.label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <ResultNotice rulesVersion={result.rulesVersion} />
      <p className="max-w-2xl text-sm text-ink-muted">
        This estimate is never a legal determination. It compares broad ranges with the threshold
        shown above, so use it to decide what to check next.
      </p>

      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
        <PrintButton />
        <ButtonLink href={changeHref} variant="secondary" className="w-full sm:w-auto">
          Change answers
        </ButtonLink>
      </div>
    </div>
  );
}
