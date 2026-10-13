import { PageContainer } from '@/components/layout/PageContainer';
import { ProductPreview } from '@/components/hero/ProductPreview';
import { ScrollWords } from '@/components/motion/ScrollWords';
import { ABOUT_TEXT } from '@/lib/config/home-content';

/**
 * "About us" block: the eyebrow on the left, a statement whose words darken as it scrolls, and
 * the sample compliance snapshot underneath.
 */
export function AboutSection() {
  return (
    <section aria-labelledby="about-title" className="bg-canvas py-[var(--section-gap)]">
      <PageContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <h2 id="about-title" className="t-eyebrow lg:col-span-3">
            What this is
          </h2>
          <div className="min-w-0 lg:col-span-9">
            <ScrollWords
              text={ABOUT_TEXT}
              className="max-w-[34ch] font-display text-[clamp(1.75rem,1.1rem+2.3vw,3rem)] leading-[1.15] font-medium tracking-[-0.025em] text-ink"
            />
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8 lg:col-start-4">
            <ProductPreview />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
