import { ChangelogTimeline, type TimelineEntry } from '@/components/content/ChangelogTimeline';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { ruleLabel } from '@/lib/config/rule-labels';
import { rules } from '@/lib/config/rules';
import type { RuleStatus } from '@/lib/config/rules-schema';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatDate, formatDateShort, formatGBPExact } from '@/lib/utils/format';
import { getRuleDisplay } from '@/lib/utils/rules-display';

export const metadata = routeMetadata('/rules-changelog');

interface SnapshotRow {
  key: string;
  value: string;
  status: RuleStatus;
  sourceTitle: string;
  sourceUrl: string;
  sourceDate: string | null;
  reviewedAt: string;
}

const TO_CONFIRM = 'To be confirmed';

function snapshotRows(): SnapshotRow[] {
  const row = (
    key: string,
    value: string,
    rule: Omit<SnapshotRow, 'key' | 'value'>,
  ): SnapshotRow => ({
    key,
    value,
    status: rule.status,
    sourceTitle: rule.sourceTitle,
    sourceUrl: rule.sourceUrl,
    sourceDate: rule.sourceDate,
    reviewedAt: rule.reviewedAt,
  });
  const display = (key: Parameters<typeof getRuleDisplay>[0]) => getRuleDisplay(key).text;
  const rate = rules.rateState.value?.currentRate;

  return [
    row('startDate', display('startDate'), rules.startDate),
    row(
      'registrationThreshold',
      `${display('registrationThreshold')} over ${display('registrationThresholdPeriod')}`,
      rules.registrationThreshold,
    ),
    row(
      'thresholdTests',
      rules.thresholdTests.value ? `${rules.thresholdTests.value.length} tests` : TO_CONFIRM,
      rules.thresholdTests,
    ),
    row(
      'thresholdExclusions',
      rules.thresholdExclusions.value ? 'Categories listed in guidance' : TO_CONFIRM,
      rules.thresholdExclusions,
    ),
    row('sectors', display('sectorList'), rules.sectors),
    row(
      'commodityScopeBasis',
      rules.commodityScopeBasis.value ? 'By commodity code' : TO_CONFIRM,
      rules.commodityScopeBasis,
    ),
    row(
      'registrationOpens',
      rules.registrationOpens.value ? formatDate(rules.registrationOpens.value) : TO_CONFIRM,
      rules.registrationOpens,
    ),
    row('registrationDeadline', display('registrationDeadline'), rules.registrationDeadline),
    row('firstReturnDeadline', display('firstReturnDeadline'), rules.firstReturnDeadline),
    row('paymentDeadline', display('paymentDeadline'), rules.paymentDeadline),
    row(
      'rateState',
      rate != null ? `${formatGBPExact(rate)} per tCO2e` : 'No rate published yet',
      rules.rateState,
    ),
    row(
      'carbonPriceRelief',
      rules.carbonPriceRelief.value ? 'Concept described, no figures' : TO_CONFIRM,
      rules.carbonPriceRelief,
    ),
    row('recordRetention', display('recordRetention'), rules.recordRetention),
  ];
}

export default function RulesChangelogPage() {
  const rows = snapshotRows();
  const entries: TimelineEntry[] = rules.changelog.map((entry, index) => ({
    id: `change-${index}`,
    date: entry.date,
    title: index === 0 ? 'Latest change' : 'Earlier change',
    body: entry.summary,
    meta: `Affected values: ${entry.affectedKeys.map(ruleLabel).join(', ')}`,
  }));

  return (
    <>
      <PageHeader
        formLabel="Rules changelog"
        title="Every change to the rules we show, with the date."
        lead="The figures and dates on this site come from one rules snapshot. When it changes, the change is listed here, so you can see what moved and what it rests on."
      >
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-subtle">
          <span>
            Current snapshot <span className="font-medium text-ink">{rules.rulesVersion}</span>
          </span>
          <span>Reviewed {formatDate(rules.reviewedAt)}</span>
        </p>
      </PageHeader>

      <Section spacing="compact" labelledBy="snapshot-title">
        <ChapterHeading id="snapshot-title" title="What the snapshot says today." />
        <div
          className="relative mt-10 overflow-x-auto rounded-sm border border-line"
          role="region"
          aria-label="Current rules snapshot"
          tabIndex={0}
        >
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <caption className="sr-only">
              Every value in the rules snapshot with its status and source
            </caption>
            <thead className="bg-surface-alt text-sm text-ink">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Value
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  As shown
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Source
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Source date
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Checked
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.key} className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-ink">
                    {ruleLabel(item.key)}
                  </th>
                  <td className="px-4 py-3 text-ink-muted">{item.value}</td>
                  <td className="px-4 py-3">
                    <ProvenanceBadge provenance={item.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <ExternalLink href={item.sourceUrl}>{item.sourceTitle}</ExternalLink>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-ink-muted">
                    {item.sourceDate ? formatDateShort(item.sourceDate) : 'Not given'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-ink-muted">
                    {formatDateShort(item.reviewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-ink-subtle">
          Official means the value was checked against the cited GOV.UK or legislation.gov.uk page
          on the date shown. Unverified means it has not been checked, so we show no figure.
        </p>
      </Section>

      <Section tone="alt" labelledBy="log-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-4">
            <ChapterHeading id="log-title" title="What changed, newest first." />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <ChangelogTimeline entries={entries} label="Rules changelog" />
          </div>
        </div>
      </Section>
    </>
  );
}
