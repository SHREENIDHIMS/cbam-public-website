import type { Route } from 'next';
import { CircleCheck } from 'lucide-react';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { CTASection } from '@/components/conversion/CTASection';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { ResultNotice } from '@/components/results/ResultNotice';
import { Alert } from '@/components/shared/Alert';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { ScenarioBadge } from '@/components/tools/ScenarioBadge';
import { ReliefCalculatorClient } from '@/components/tools/ReliefCalculatorClient';
import { rules } from '@/lib/config/rules';
import { SCENARIO_ASSUMPTIONS } from '@/lib/config/scenario-assumptions';
import { routeMetadata } from '@/lib/seo/metadata';

export const metadata = routeMetadata('/carbon-price-relief');

const WHEN_IT_MATTERS = [
  {
    title: 'The producer pays a carbon price at home',
    body: 'Some countries charge for emissions through a tax or a trading scheme. If the goods you import were made under one, part of the carbon cost may already have been paid.',
  },
  {
    title: 'The scheme meets the UK criteria',
    body: 'Only schemes that meet HMRC criteria qualify. Voluntary schemes and schemes run by non-governmental bodies do not.',
  },
  {
    title: 'You can evidence the amount',
    body: 'A claim rests on a carbon pricing verification form completed by an independent verifier, not on a supplier saying a price was paid.',
  },
] as const;

const CHECKLIST = [
  'The producer and installation that made the goods',
  'The carbon pricing scheme the installation takes part in, checked against the current list',
  'A completed carbon pricing verification form for each good you claim for',
  'Confirmation of who verified it and that they meet the requirements',
  'The effective carbon price calculation, with its inputs',
  'The exchange rates used to convert amounts into sterling',
] as const;

export default function CarbonPriceReliefPage() {
  const relief = rules.carbonPriceRelief;
  const defaults = {
    massTonnes: 100,
    intensity: SCENARIO_ASSUMPTIONS.defaultIntensityIronSteel.value,
    rate: SCENARIO_ASSUMPTIONS.rate.value,
    coveredShare: 1,
    effectivePrice: SCENARIO_ASSUMPTIONS.relief.value,
  };

  return (
    <>
      <PageHeader
        formLabel="Carbon price relief"
        title="Avoiding a charge for the same carbon twice."
        lead="If a carbon price has already been paid on the emissions in your imported goods, relief may reduce the UK charge. It is a claim you evidence, not an automatic deduction."
      >
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-subtle">
          <ProvenanceBadge provenance={relief.status} />
          <span>Source:</span>
          <ExternalLink href={relief.sourceUrl}>{relief.sourceTitle}</ExternalLink>
        </p>
      </PageHeader>

      <Section labelledBy="meaning-title" spacing="compact">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <ChapterHeading id="meaning-title" title="Relief for a carbon price already paid." />
          </div>
          <div className="min-w-0 lg:col-span-7">
            <p className="text-lg text-ink-muted">{relief.value}</p>
            <p className="mt-5 text-ink-muted">
              In the official calculation, relief comes off the end: embodied emissions multiplied
              by the CBAM rate, less carbon price relief. The relief for a good is its effective
              carbon price multiplied by the emissions that were subject to the scheme.
            </p>
            <p className="mt-5">
              <ButtonLink
                href={'/guides/carbon-price-relief-explained' as Route}
                variant="secondary"
              >
                Read the full guide
              </ButtonLink>
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt" labelledBy="when-title">
        <ChapterHeading
          id="when-title"
          title="Three things have to line up."
          lead="Relief only matters where the goods were made under a qualifying scheme and the evidence exists. This site cannot tell you whether that is true for your goods."
        />
        <ol className="ledger m-0 mt-14 list-none p-0">
          {WHEN_IT_MATTERS.map((point, index) => (
            <li key={point.title} className="grid grid-cols-1 gap-3 py-7 md:grid-cols-12 md:gap-8">
              <h3 className="flex items-start gap-4 md:col-span-5">
                <span aria-hidden="true" className="box-no mt-0.5 text-primary">
                  {index + 1}
                </span>
                <span className="t-title">{point.title}</span>
              </h3>
              <p className="max-w-[58ch] pl-10 text-ink-muted md:col-span-7 md:pl-0">
                {point.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="evidence-title">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <ChapterHeading
              id="evidence-title"
              title="The form is the centre of a claim."
              lead="HMRC says three conditions must be met: the emissions were subject to a qualifying scheme, you obtained a completed verification form, and an independent verifier who meets the standards completed it."
            />
          </div>
          <div className="min-w-0 lg:col-span-7">
            <h3 className="t-title">Evidence checklist</h3>
            <ul className="m-0 mt-5 list-none divide-y divide-line border-y border-line p-0">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 py-4 text-ink-muted">
                  <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-ink-subtle">
              Keep these records for {rules.recordRetention.value ?? 'the period HMRC sets'},
              counted from the later of the date the record was created and the end of the
              accounting period.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt" labelledBy="example-title">
        <ChapterHeading
          id="example-title"
          title="See how relief changes a number."
          lead="A sample steel line with scenario values. Change anything, and untick the evidence box to see the position without relief."
        />
        <div className="mt-14">
          <ReliefCalculatorClient
            defaults={defaults}
            notice={<ResultNotice />}
            badge={<ScenarioBadge />}
            badgeSmall={<ScenarioBadge className="text-xs" />}
          />
        </div>
        <Alert tone="watch" title="Scenario values" className="mt-8 max-w-3xl">
          The rate, intensity and carbon price in this example are invented for illustration. They
          are not official values and not a forecast. The qualifying scheme list is published by
          HMRC and was provisional on the review date.
        </Alert>
        <p className="mt-8">
          <ButtonLink href="/liability-preview" size="lg">
            Open the liability preview
          </ButtonLink>
        </p>
      </Section>

      <CTASection
        title="See relief alongside your own lines."
        body="The liability preview shows relief as its own line in the workings, with the assumption labelled so it is never mistaken for an official value."
        note="Indicative, based on the information you provide. Not legal or tax advice."
      />
    </>
  );
}
