import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { PageContainer } from '@/components/layout/PageContainer';
import { VisuallyHidden } from '@/components/shared/VisuallyHidden';
import { getRuleFacts, type RuleFact } from '@/lib/utils/rules-facts';
import { cn } from '@/lib/utils/cn';

/**
 * Regulatory facts as a row of boxed fields, each stamped with its source status. Values and
 * stamps come from the rules config; nothing is typed here.
 */
export function FactStrip({ facts = getRuleFacts() }: { facts?: RuleFact[] }) {
  return (
    <section
      aria-labelledby="facts-title"
      className="bg-canvas pt-[calc(var(--section-gap)*0.5)] pb-[calc(var(--section-gap)*0.5)]"
    >
      <PageContainer>
        <h2 id="facts-title" className="sr-only">
          UK CBAM key facts, with their source status
        </h2>
        <dl className="box m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={fact.key}
              className={cn(
                'flex min-w-0 flex-col',
                index > 0 && 'border-t border-line sm:border-t-0',
                index % 2 === 1 && 'sm:border-l sm:border-line',
                index >= 2 && 'sm:border-t sm:border-line lg:border-t-0',
                index > 0 && 'lg:border-l lg:border-line',
              )}
            >
              <dt className="t-label border-b border-line px-5 py-2.5 text-ink-subtle">
                {fact.label}
              </dt>
              <dd className="m-0 flex flex-1 flex-col gap-3 px-5 pt-5 pb-5">
                <span
                  className={cn(
                    't-figure-lg',
                    !fact.confirmed && 'text-[1.375rem] font-[650] text-ink-muted',
                  )}
                >
                  {fact.value}
                </span>
                <span className="text-sm text-ink-muted">{fact.detail}</span>
                <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                  <ProvenanceBadge provenance={fact.provenance} />
                  <ExternalLink href={fact.sourceUrl} className="text-sm">
                    Source
                    <VisuallyHidden>: {fact.sourceTitle}</VisuallyHidden>
                  </ExternalLink>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </PageContainer>
    </section>
  );
}
