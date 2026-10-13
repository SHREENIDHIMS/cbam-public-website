import Link from 'next/link';
import { ArrowRight, FlaskConical, Landmark } from 'lucide-react';
import { ChangelogTimeline, type TimelineEntry } from '@/components/content/ChangelogTimeline';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { RateAlertForm } from '@/components/forms/RateAlertForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { DemoDataIndicator } from '@/components/results/DemoDataIndicator';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { unstable_noStore as noStore } from 'next/cache';
import { AdapterUnavailable } from '@/components/shared/AdapterUnavailable';
import { attempt } from '@/lib/api/attempt';
import { getAdapter } from '@/lib/api/client';
import { RATE_EVENT_SEEDS, RATE_SOURCES } from '@/lib/config/rate-watch';
import { ruleLabel } from '@/lib/config/rule-labels';
import { rules } from '@/lib/config/rules';
import { siteConfig } from '@/lib/config/site';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatDate, formatDateShort, formatGBPExact, toLondonIsoDate } from '@/lib/utils/format';

// "Upcoming" markers depend on today's date, so the page revalidates daily.
export const revalidate = 86400;

export const metadata = routeMetadata('/rate-watch');

export default async function RateWatchPage() {
  const loaded = await attempt(() => getAdapter().getRateWatch());
  if (!loaded.ok) {
    // Do not cache the failure for the revalidation period.
    noStore();
    return <AdapterUnavailable title="Rate watch could not load" error={loaded.error} />;
  }
  const watch = loaded.data;
  const state = rules.rateState;
  const official = state.value;
  const today = toLondonIsoDate(new Date());
  const startDate = rules.startDate.value;

  const timeline: TimelineEntry[] = [
    ...RATE_EVENT_SEEDS.map((event) => ({
      id: event.id,
      ...(event.date ? { date: event.date } : {}),
      ...(event.dateLabel ? { dateLabel: event.dateLabel } : {}),
      title: event.title,
      body: event.body,
      tag: event.tag,
      upcoming: event.date ? event.date > today : true,
    })),
    ...(startDate
      ? [
          {
            id: 'start',
            date: startDate,
            title: 'CBAM applies and quarterly rates begin',
            body: 'The policy summary says rates are calculated and published at the beginning of each quarter from this date.',
            tag: 'Official',
            upcoming: startDate > today,
          },
        ]
      : []),
  ];

  const changes: TimelineEntry[] = rules.changelog.slice(0, 3).map((entry, index) => ({
    id: `change-${index}`,
    date: entry.date,
    title: 'Rules snapshot updated',
    body: entry.summary,
    meta: `Affected: ${entry.affectedKeys.map(ruleLabel).join(', ')}`,
  }));

  return (
    <>
      <PageHeader
        formLabel="Rate watch"
        title="Official rates and scenario rates, kept apart."
        lead="What is officially known about the CBAM rate, what is only an illustration, where each comes from and when it was last checked."
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-subtle">
          <DemoDataIndicator dataSource={watch.dataSource} />
          <span>
            Rules snapshot {watch.rulesVersion}, reviewed {formatDate(rules.reviewedAt)}
          </span>
        </div>
      </PageHeader>

      <Section spacing="compact" labelledBy="state-title">
        <h2 id="state-title" className="sr-only">
          Current known state
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article aria-labelledby="official-title" className="box flex flex-col p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id="official-title" className="t-title flex items-center gap-2">
                <Landmark aria-hidden="true" className="size-5 text-primary" />
                Official
              </h3>
              <ProvenanceBadge provenance={state.status} />
            </div>
            <p className="mt-6 text-sm text-ink-subtle">Current CBAM rate</p>
            <p className="t-figure-lg mt-1">
              {official?.currentRate != null
                ? `${formatGBPExact(official.currentRate)} per tCO2e`
                : 'Not yet published'}
            </p>
            <p className="mt-3 text-ink-muted">
              {official?.currentRate != null
                ? 'As published by the government.'
                : 'We found no published CBAM rate on the official pages we read. When one is published it will appear here with its source and date.'}
            </p>
            {official?.mechanism ? (
              <div className="mt-6 border-t border-line pt-5">
                <h4 className="t-label text-ink-subtle">How the rate is set</h4>
                <p className="mt-2 text-ink-muted">{official.mechanism}</p>
              </div>
            ) : null}
            <dl className="m-0 mt-6 grid grid-cols-1 gap-4 border-t border-line pt-5 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-ink-subtle">Source date</dt>
                <dd className="m-0 font-semibold text-ink">
                  {state.sourceDate ? formatDateShort(state.sourceDate) : 'To be confirmed'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-subtle">Effective from</dt>
                <dd className="m-0 font-semibold text-ink">
                  {startDate ? formatDateShort(startDate) : 'To be confirmed'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-subtle">Last checked</dt>
                <dd className="m-0 font-semibold text-ink">{formatDateShort(state.reviewedAt)}</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm">
              <ExternalLink href={state.sourceUrl}>{state.sourceTitle}</ExternalLink>
            </p>
          </article>

          <article
            aria-labelledby="scenario-title"
            className="flex flex-col rounded-sm border-2 border-dashed border-watch-fg/40 bg-watch-bg/40 p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 id="scenario-title" className="t-title flex items-center gap-2">
                <FlaskConical aria-hidden="true" className="size-5 text-watch-fg" />
                Scenario or illustrative
              </h3>
              <ProvenanceBadge provenance="scenario" />
            </div>
            {watch.scenarios.length > 0 ? (
              watch.scenarios.map((scenario) => (
                <div key={scenario.key} className="mt-6">
                  <p className="text-sm text-ink-subtle">{scenario.label}</p>
                  <p className="t-figure-lg mt-1">
                    {formatGBPExact(scenario.ratePerTonne)} per tCO2e
                  </p>
                  <p className="mt-3 text-ink-muted">{scenario.note}</p>
                </div>
              ))
            ) : (
              <p className="mt-6 text-ink-muted">No scenario rate is in use at the moment.</p>
            )}
            <div className="mt-6 border-t border-watch-fg/25 pt-5">
              <h4 className="t-label text-ink-subtle">What this is for</h4>
              <p className="mt-2 text-ink-muted">
                The tools on this site need a rate to show how a calculation works. Until an
                official rate is published they use this invented value, and every result labels it
                as a scenario. It is not a forecast and not an official figure.
              </p>
            </div>
          </article>
        </div>
      </Section>

      <Section tone="alt" labelledBy="timeline-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-4">
            <ChapterHeading
              id="timeline-title"
              title="What has happened and what is expected."
              lead="Solid markers are past events. Hollow markers have not happened yet or have not been found."
            />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <ChangelogTimeline entries={timeline} label="Rate timeline" />
          </div>
        </div>
      </Section>

      <Section labelledBy="sources-title">
        <ChapterHeading id="sources-title" title="Where each statement comes from." />
        <ul className="ledger m-0 mt-14 list-none p-0">
          {RATE_SOURCES.map((source) => (
            <li key={source.key} className="grid grid-cols-1 gap-4 py-7 md:grid-cols-12 md:gap-8">
              <div className="flex flex-col items-start gap-3 md:col-span-3">
                <ProvenanceBadge provenance="official" />
                <p className="t-figure text-[0.8125rem] text-ink-subtle">
                  {source.publisher}
                  <br />
                  {source.dateLabel} {formatDate(source.date)}
                </p>
              </div>
              <div className="md:col-span-9">
                <h3 className="t-title">{source.title}</h3>
                <p className="mt-3 max-w-[62ch] text-ink-muted">{source.summary}</p>
                <p className="mt-4 text-sm">
                  <ExternalLink href={source.url}>Open the source</ExternalLink>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="alt" labelledBy="changelog-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-4">
            <ChapterHeading id="changelog-title" title="Recent changes to our rules snapshot." />
            <p className="mt-6">
              <Link
                href="/rules-changelog"
                className="link inline-flex items-center gap-2 font-semibold"
              >
                See the full rules changelog
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </p>
          </div>
          <div className="min-w-0 lg:col-span-8">
            <ChangelogTimeline entries={changes} label="Recent rules changes" />
          </div>
        </div>
      </Section>

      <Section labelledBy="alerts-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <ChapterHeading
              id="alerts-title"
              title="Hear when the rate or the rules change."
              lead="One short email when an official rate is published or something in our rules snapshot changes. Nothing else unless you ask for it."
            />
          </div>
          <div className="min-w-0 rounded-sm border border-line bg-surface p-6 shadow-sm md:p-8 lg:col-span-7">
            <RateAlertForm brandName={siteConfig.brandName} demo={watch.dataSource === 'fixture'} />
          </div>
        </div>
      </Section>
    </>
  );
}
