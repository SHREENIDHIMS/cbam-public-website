import { ChapterHeading } from '@/components/content/ChapterHeading';
import { PageContainer } from '@/components/layout/PageContainer';
import { CountUp } from '@/components/motion/CountUp';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { VisuallyHidden } from '@/components/shared/VisuallyHidden';
import { getRuleFacts, type RuleFact } from '@/lib/utils/rules-facts';

type Tone = 'inverse' | 'brand' | 'canvas';

const CARDS: ReadonlyArray<{ key: RuleFact['key']; tone: Tone }> = [
  { key: 'threshold', tone: 'inverse' },
  { key: 'sectors', tone: 'brand' },
  { key: 'retention', tone: 'canvas' },
];

/** Splits a display value such as "£50,000" or "6 years" into prefix, number and suffix. */
function parseCount(value: string): { prefix: string; to: number; suffix: string } | null {
  const match = /^(\D*?)(\d[\d,]*)(.*)$/.exec(value);
  if (!match) return null;
  return {
    prefix: match[1] ?? '',
    to: Number((match[2] ?? '').replace(/,/g, '')),
    suffix: match[3] ?? '',
  };
}

/**
 * Three big numbers on cards that stack over each other as the page scrolls (sticky), each
 * counting up when it arrives. Every value and source comes from the rules config.
 */
export function CoreValue() {
  const facts = getRuleFacts();
  const cards = CARDS.map((card) => ({
    ...card,
    fact: facts.find((fact) => fact.key === card.key),
  })).filter((card): card is { key: RuleFact['key']; tone: Tone; fact: RuleFact } =>
    Boolean(card.fact?.confirmed),
  );

  return (
    <section aria-labelledby="value-title" className="bg-canvas py-[var(--section-gap)]">
      <PageContainer>
        <ChapterHeading
          id="value-title"
          eyebrow="Core facts"
          title="Three numbers that frame the whole job."
          lead="Each one is read from our rules snapshot and links to the page it came from."
        />
        <div className="mt-16 flex flex-col gap-6">
          {cards.map(({ key, tone, fact }, index) => {
            const count = parseCount(fact.value);
            return (
              <article
                key={key}
                data-tone={tone === 'canvas' ? undefined : tone}
                className={`sticky grid min-h-[22rem] grid-cols-1 content-between gap-8 rounded-lg p-8 md:grid-cols-12 md:p-12 ${
                  tone === 'inverse'
                    ? 'bg-inverse'
                    : tone === 'brand'
                      ? 'bg-brand'
                      : 'border border-line bg-surface'
                } text-ink`}
                style={{ top: `${6 + index * 1.25}rem` }}
              >
                <h3 className="t-label md:col-span-12">{fact.label}</h3>
                <p className="font-display text-[clamp(3.5rem,1.5rem+9vw,9rem)] leading-none font-medium tracking-[-0.04em] md:col-span-7">
                  {count ? (
                    <CountUp to={count.to} prefix={count.prefix} suffix={count.suffix} />
                  ) : (
                    fact.value
                  )}
                </p>
                <div className="flex flex-col gap-4 md:col-span-5 md:justify-end">
                  <p className="text-ink-muted">{fact.detail}</p>
                  <ExternalLink href={fact.sourceUrl} className="w-fit text-sm">
                    Source
                    <VisuallyHidden>: {fact.sourceTitle}</VisuallyHidden>
                  </ExternalLink>
                </div>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
