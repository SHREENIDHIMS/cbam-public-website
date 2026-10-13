import { ChapterHeading } from '@/components/content/ChapterHeading';
import { PageContainer } from '@/components/layout/PageContainer';
import { Marquee } from '@/components/motion/Marquee';
import { getRuleFacts } from '@/lib/utils/rules-facts';

/**
 * Where the reference shows a testimonial strip, we show the official pages the figures come
 * from. No quotes and no customers exist, so none are shown.
 */
export function SourcesBand() {
  const titles = [...new Set(getRuleFacts().map((fact) => fact.sourceTitle))];
  return (
    <section aria-labelledby="sources-title" className="bg-canvas py-[var(--section-gap)]">
      <PageContainer>
        <ChapterHeading
          id="sources-title"
          eyebrow="Sources"
          title="Every figure names the page it came from."
        />
      </PageContainer>
      <div className="mt-14">
        <Marquee seconds={32}>
          {titles.map((title) => (
            <div
              key={title}
              className="flex w-80 shrink-0 flex-col gap-3 rounded-xs border border-line bg-surface p-6"
            >
              <span className="t-label text-primary">Official source</span>
              <p className="font-display text-lg leading-snug font-medium tracking-[-0.02em] text-ink">
                {title}
              </p>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
