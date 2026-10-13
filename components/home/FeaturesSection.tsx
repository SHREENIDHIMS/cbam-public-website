import { ChapterHeading } from '@/components/content/ChapterHeading';
import { PageContainer } from '@/components/layout/PageContainer';
import { FEATURES } from '@/lib/config/home-content';
import { ContainerArt } from './ContainerArt';
import { FeatureAccordion } from './FeatureAccordion';

/** Accordion of the six capabilities beside a rounded navy picture panel. */
export function FeaturesSection() {
  return (
    <section aria-labelledby="features-title" className="bg-surface-alt py-[var(--section-gap)]">
      <PageContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div
            aria-hidden="true"
            data-tone="inverse"
            className="order-last flex aspect-[4/3] items-end overflow-hidden rounded-lg bg-inverse px-6 pt-10 lg:order-first"
          >
            <ContainerArt variant="still" />
          </div>
          <div className="min-w-0">
            <ChapterHeading
              id="features-title"
              eyebrow="What the position shows"
              title="Everything you need to see, and nothing you do not."
            />
            <div className="mt-10">
              <FeatureAccordion items={FEATURES} />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
