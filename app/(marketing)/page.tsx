import { RevealClient } from '@/components/content/RevealClient';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { GuideTeasers } from '@/components/content/GuideTeasers';
import { Reveal } from '@/components/content/Reveal';
import { SplitFeature } from '@/components/content/SplitFeature';
import { BrokerSection } from '@/components/conversion/BrokerSection';
import { CTASection } from '@/components/conversion/CTASection';
import { FAQSection } from '@/components/conversion/FAQSection';
import { CalculationPreview } from '@/components/hero/CalculationPreview';
import { FactStrip } from '@/components/hero/FactStrip';
import { HeroSection } from '@/components/hero/HeroSection';
import { SupplierStoryPreview } from '@/components/hero/SupplierStoryPreview';
import { AboutSection } from '@/components/home/AboutSection';
import { CoreValue } from '@/components/home/CoreValue';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProcessScene } from '@/components/home/ProcessScene';
import { SectorBand } from '@/components/home/SectorBand';
import { SourcesBand } from '@/components/home/SourcesBand';
import { ToolCards } from '@/components/home/ToolCards';
import { Section } from '@/components/layout/Section';
import { JsonLd } from '@/components/shared/JsonLd';
import { getFaqEntries } from '@/lib/config/faq';
import { getFeaturedGuides } from '@/lib/content/guides';
import { HOME_METADATA } from '@/lib/config/home-content';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/config/site';
import { faqPageJsonLd, organizationJsonLd } from '@/lib/seo/structured-data';

// The eyebrow and fact strip depend on the current date, so the page revalidates daily.
export const revalidate = 86400;

export const metadata = buildMetadata({
  title: HOME_METADATA.title,
  description: HOME_METADATA.description,
  path: '/',
});

export default async function HomePage() {
  const faqEntries = getFaqEntries();
  const featuredGuides = await getFeaturedGuides(4);

  return (
    <>
      <HeroSection />
      <FactStrip />
      <AboutSection />
      <SectorBand />
      <ProcessScene />
      <FeaturesSection />

      <Section tone="inverse" labelledBy="supplier-title">
        <SplitFeature
          even
          copy={
            <ChapterHeading
              id="supplier-title"
              eyebrow="Supplier data"
              title="One missing answer can move the number."
              lead="Producer emissions data replaces published defaults and usually lowers the estimate. Knowing which suppliers have replied, and which have not, tells you where to spend your time."
            />
          }
          visual={
            <Reveal>
              <SupplierStoryPreview />
            </Reveal>
          }
        />
      </Section>

      <Section labelledBy="numbers-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <ChapterHeading
              id="numbers-title"
              eyebrow="The working"
              title="Why is this the number?"
            />
          </div>
          <p className="t-lead min-w-0 lg:col-span-5">
            Every line can be opened up. You see the customs value, the quantity, the emissions
            basis, the rate, the gross charge, any relief and the indicative net position, each
            labelled by where it came from.
          </p>
        </div>
        <Reveal className="mt-16">
          <CalculationPreview />
        </Reveal>
      </Section>

      <CoreValue />
      <ToolCards />

      <Section tone="alt" labelledBy="brokers-title">
        <BrokerSection />
      </Section>

      <SourcesBand />

      <Section tone="alt" labelledBy="guides-title">
        <p aria-hidden="true" className="t-giant mb-12 text-center text-ink select-none">
          Guides
        </p>
        <ChapterHeading
          id="guides-title"
          eyebrow="Knowledge centre"
          title="Plain-English guides, with the sources alongside."
          lead="Short explainers on the questions importers ask most, each one dated and linked to its official source."
        />
        <GuideTeasers guides={featuredGuides} />
      </Section>

      <Section labelledBy="faq-title">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-4">
            <ChapterHeading
              id="faq-title"
              eyebrow="FAQ"
              title="Questions we hear most."
              lead="Answers are based on our rules snapshot. Check the linked source before relying on any figure."
            />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <FAQSection entries={faqEntries} />
          </div>
        </div>
      </Section>

      <CTASection
        title="Find out where you stand."
        body="Start with what you have today, a rough estimate or a customs file. You will see an indicative position and what would sharpen it."
        note="Indicative, based on the information you provide. Not legal or tax advice."
      />

      <JsonLd data={faqPageJsonLd(faqEntries)} />
      <JsonLd
        data={organizationJsonLd({
          name: siteConfig.brandName,
          url: absoluteUrl('/'),
          description: siteConfig.description,
        })}
      />
      <RevealClient />
    </>
  );
}
