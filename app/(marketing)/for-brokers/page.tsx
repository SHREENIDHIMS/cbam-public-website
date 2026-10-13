import { Check } from 'lucide-react';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { BrokerPortfolioPreview } from '@/components/conversion/BrokerPortfolioPreview';
import { ContactForm } from '@/components/conversion/ContactForm';
import { TrackedAnchorClient } from '@/components/conversion/TrackedAnchorClient';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Alert } from '@/components/shared/Alert';
import { Badge } from '@/components/shared/Badge';
import {
  BROKER_AVAILABILITY_LABELS,
  BROKER_BOUNDARY_NOTE,
  BROKER_CAPABILITIES,
  BROKER_FORM_COPY,
  BROKER_PREVIEW_NOTE,
  BROKER_WHITE_LABEL_NOTE,
} from '@/lib/config/broker-content';
import { routeMetadata } from '@/lib/seo/metadata';
import { submitBrokerContact } from './actions';

export const metadata = routeMetadata('/for-brokers');

const CTA_CLASSES = 'btn btn-primary btn-lg';

export default function ForBrokersPage() {
  return (
    <>
      <PageHeader
        formLabel="For brokers and partners"
        title="Several importers, one clear view."
        lead="If you support customs, compliance or logistics clients, this is how we expect a portfolio view to work. Some of it is being scoped and some is still a concept, and we label which."
      >
        <TrackedAnchorClient
          href="#talk-to-us"
          location="hero"
          cta="contact"
          className={CTA_CLASSES}
        >
          Talk to us about your portfolio
        </TrackedAnchorClient>
      </PageHeader>

      <Section labelledBy="capabilities-title">
        <ChapterHeading
          id="capabilities-title"
          title="Built around how brokers actually work."
          lead="Each importer stays separate, and you see them side by side. The labels show how far each idea has got."
        />
        <ul className="m-0 mt-14 grid list-none border-t-2 border-ink p-0 sm:grid-cols-2 lg:grid-cols-3">
          {BROKER_CAPABILITIES.map((item) => (
            <li
              key={item.key}
              className="border-b border-line py-8 sm:pr-8 sm:odd:border-r lg:border-r-0 lg:pr-10 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-10"
            >
              <Badge tone={item.availability === 'in_scoping' ? 'info' : 'neutral'}>
                {BROKER_AVAILABILITY_LABELS[item.availability]}
              </Badge>
              <h3 className="t-title mt-5">{item.title}</h3>
              <p className="mt-3 max-w-sm text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-ink-muted">{BROKER_WHITE_LABEL_NOTE}</p>
      </Section>

      <Section tone="alt" labelledBy="preview-title">
        <ChapterHeading
          id="preview-title"
          title="What the portfolio table might show."
          lead="Position, indicative exposure and supplier data coverage for each client, in one place."
        />
        <div className="mt-12 max-w-4xl">
          <BrokerPortfolioPreview />
          <p className="mt-4 text-sm text-ink-subtle">{BROKER_PREVIEW_NOTE}</p>
        </div>
      </Section>

      <Section labelledBy="talk-title" id="talk-to-us" className="scroll-mt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <ChapterHeading id="talk-title" title={BROKER_FORM_COPY.title} />
            <p className="mt-6 max-w-md text-lg text-ink-muted">{BROKER_FORM_COPY.lead}</p>
            <h3 className="mt-10 text-base font-semibold text-ink">What happens next</h3>
            <ul className="m-0 mt-4 list-none space-y-3 p-0">
              {BROKER_FORM_COPY.whatNext.map((line) => (
                <li key={line} className="flex items-start gap-3 text-ink-muted">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <Alert tone="neutral" className="mt-10">
              {BROKER_BOUNDARY_NOTE}
            </Alert>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <div className="box p-6 md:p-8">
              <ContactForm
                action={submitBrokerContact}
                kind="broker"
                label="Talk to us about your portfolio"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
