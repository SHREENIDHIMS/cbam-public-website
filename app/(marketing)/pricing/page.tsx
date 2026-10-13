import type { Route } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { ContactForm } from '@/components/conversion/ContactForm';
import { CTASection } from '@/components/conversion/CTASection';
import { FAQSection } from '@/components/conversion/FAQSection';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Alert } from '@/components/shared/Alert';
import { ButtonLink } from '@/components/shared/ButtonLink';
import {
  PRICING_CLARIFICATIONS,
  PRICING_PLANS,
  PRICING_STATUS_NOTE,
  priceLabel,
} from '@/lib/config/pricing';
import { routeMetadata } from '@/lib/seo/metadata';
import { submitPricingContact } from './actions';

export const metadata = routeMetadata('/pricing');

export default function PricingPage() {
  return (
    <>
      <PageHeader
        formLabel="Pricing"
        title="Plain about what is, and is not, settled."
        lead="Two kinds of plan are planned: one for importers and one for brokers and partners. Prices have not been approved, so we say so rather than show a number."
      />

      <section aria-label="Plans" className="bg-canvas pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-site px-5 md:px-10">
          <Alert tone="info" title="Prices are not set yet">
            {PRICING_STATUS_NOTE}
          </Alert>
          <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
            {PRICING_PLANS.map((plan) => (
              <li key={plan.key} className="box flex flex-col p-6 md:p-8">
                <h2 className="t-title">{plan.name}</h2>
                <p className="mt-3 text-ink-muted">{plan.audience}</p>
                <p className="t-figure-lg mt-6" data-testid="plan-price">
                  {priceLabel(plan)}
                </p>
                <ul className="m-0 mt-6 flex-1 list-none space-y-3 p-0">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-ink">
                      <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <ButtonLink
                    href={plan.ctaHref as Route}
                    variant={plan.key === 'importer' ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {plan.ctaLabel}
                    <span className="sr-only"> about the {plan.name} plan</span>
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 rounded-sm border border-line bg-surface-alt p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="font-semibold text-ink">Not ready to talk to anyone?</p>
              <p className="text-ink-muted">
                The exposure check needs no account and shows its working.
              </p>
            </div>
            <ButtonLink href="/exposure-check" variant="secondary">
              Check my exposure
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section tone="alt" labelledBy="clarify-title">
        <ChapterHeading id="clarify-title" title="What we can and cannot say yet." />
        <div className="mt-12 max-w-3xl">
          <FAQSection entries={PRICING_CLARIFICATIONS} />
        </div>
      </Section>

      <Section id="talk-to-us" labelledBy="talk-title" className="scroll-mt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <ChapterHeading id="talk-title" title="Ask about a plan." />
            <p className="mt-6 max-w-md text-lg text-ink-muted">
              Tell us who you are and what you import, and we will reply by email. If you support
              several importers, the{' '}
              <Link
                href="/for-brokers#talk-to-us"
                className="text-primary underline underline-offset-4"
              >
                broker page
              </Link>{' '}
              has a form for that.
            </p>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <div className="box p-6 md:p-8">
              <ContactForm action={submitPricingContact} kind="general" label="Ask about pricing" />
            </div>
          </div>
        </div>
      </Section>

      <CTASection
        title="See where you stand first."
        body="A quick estimate or an upload takes a few minutes and costs nothing. It will tell you whether a conversation about plans is even needed."
        note="Indicative results, not legal or tax advice."
      />
    </>
  );
}
