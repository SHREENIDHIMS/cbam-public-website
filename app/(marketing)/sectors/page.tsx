import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ChapterHeading } from '@/components/content/ChapterHeading';
import { CTASection } from '@/components/conversion/CTASection';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { ProvenanceBadge } from '@/components/shared/ProvenanceBadge';
import { rules } from '@/lib/config/rules';
import { SECTOR_CONTENT } from '@/lib/config/sectors';
import { getGuideBySlug } from '@/lib/content/guides';
import { routeMetadata } from '@/lib/seo/metadata';

export const metadata = routeMetadata('/sectors');

const SCOPE_POINTS = [
  {
    title: 'A label is not a code',
    body: 'Invoices say "steel", "aluminium" or "cement". Those are labels, and they are not how the legislation identifies goods.',
  },
  {
    title: 'The exact code decides',
    body: 'CBAM goods are specified by commodity code. Two products that look alike can sit either side of the line, and a product that does not sound heavy-industrial can still be caught.',
  },
  {
    title: 'Check line by line',
    body: 'Compare the code on each customs entry with the published lists. Treat "unsure" as a question to resolve, not as a no.',
  },
] as const;

export default async function SectorsPage() {
  const sectors = rules.sectors.value ?? [];
  const scopeRule = rules.commodityScopeBasis;
  const guideEntries = await Promise.all(
    sectors.map(async (sector) => {
      const slug = SECTOR_CONTENT[sector.key].relatedGuide;
      const guide = await getGuideBySlug(slug);
      return [sector.key, guide ? { slug, title: guide.frontmatter.title } : null] as const;
    }),
  );
  const guides = new Map(guideEntries);

  return (
    <>
      <PageHeader
        formLabel="Sectors"
        title="Five sectors, identified by commodity code."
        lead="UK CBAM applies to goods from five sectors. Within them, only the specific goods in the legislation are covered, and the exact commodity code decides which."
      >
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-subtle">
          <ProvenanceBadge provenance={rules.sectors.status} />
          <span>Sector list source:</span>
          <ExternalLink href={rules.sectors.sourceUrl}>{rules.sectors.sourceTitle}</ExternalLink>
        </p>
      </PageHeader>

      <Section spacing="compact" labelledBy="jump-title">
        <h2 id="jump-title" className="sr-only">
          Jump to a sector
        </h2>
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {sectors.map((sector) => (
            <li key={sector.key}>
              <a
                href={`#${sector.key}`}
                className="inline-flex min-h-11 items-center rounded-sm border border-line-strong bg-surface px-4 font-semibold text-ink no-underline hover:border-ink hover:bg-primary-tint"
              >
                {sector.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="alt" labelledBy="scope-title">
        <ChapterHeading
          id="scope-title"
          title="The exact code matters more than the product name."
          lead={scopeRule.value ?? 'Scope is decided by commodity code in the legislation.'}
        />
        <ol className="ledger m-0 mt-14 list-none p-0">
          {SCOPE_POINTS.map((point, index) => (
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
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink href={'/guides/commodity-codes-and-scope' as Route} variant="secondary">
            Read the scope guide
          </ButtonLink>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-subtle">
            <ProvenanceBadge provenance={scopeRule.status} />
            <ExternalLink href={scopeRule.sourceUrl}>{scopeRule.sourceTitle}</ExternalLink>
          </span>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-ink-subtle">
          This website does not resolve scope for you. Use the official lists for each sector, and
          treat anything this site shows as an indicative preview.
        </p>
      </Section>

      <Section labelledBy="sectors-title">
        <ChapterHeading
          id="sectors-title"
          title="What each sector looks like in a ledger."
          lead="Example products show the kinds of goods that sit under each heading. They are not a statement of scope."
        />
        <ol className="m-0 mt-14 list-none border-t-2 border-ink p-0">
          {sectors.map((sector) => {
            const content = SECTOR_CONTENT[sector.key];
            const guide = guides.get(sector.key);
            return (
              <li
                key={sector.key}
                id={sector.key}
                className="scroll-mt-24 border-b border-line py-10 md:py-14"
              >
                <article aria-labelledby={`${sector.key}-title`}>
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    <div className="min-w-0 lg:col-span-5">
                      <h3 id={`${sector.key}-title`} className="t-title">
                        {sector.label}
                      </h3>
                      <p className="mt-4 max-w-md text-ink-muted">{content.overview}</p>
                      <p className="mt-4 max-w-md text-ink-muted">
                        <span className="font-semibold text-ink">Commodity-code concept. </span>
                        {content.codeConcept}
                      </p>
                      <p className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <ButtonLink href="/exposure-check">
                          Check my exposure
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </ButtonLink>
                      </p>
                    </div>
                    <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
                      <div className="rounded-sm border border-line bg-surface p-5">
                        <h4 className="t-label text-ink-subtle">Example products</h4>
                        <ul className="m-0 mt-3 flex list-disc flex-col gap-2 pl-5 text-ink-muted">
                          {content.exampleProducts.map((product) => (
                            <li key={product}>{product}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-sm border border-line bg-surface p-5">
                        <h4 className="t-label text-ink-subtle">Typical evidence questions</h4>
                        <ul className="m-0 mt-3 flex list-disc flex-col gap-2 pl-5 text-ink-muted">
                          {content.evidenceQuestions.map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-sm border border-line bg-surface p-5 sm:col-span-2">
                        <h4 className="t-label text-ink-subtle">What you will usually need</h4>
                        <p className="mt-3 text-ink-muted">{content.dataNeeds.join(', ')}.</p>
                        {guide ? (
                          <p className="mt-4 border-t border-line pt-4">
                            <span className="text-sm text-ink-subtle">Related guide: </span>
                            <Link
                              href={`/guides/${guide.slug}` as Route}
                              className="link font-semibold"
                            >
                              {guide.title}
                            </Link>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </Section>

      <CTASection
        title="Find out which of your lines are in play."
        body="Upload a customs export or answer five short questions. You will see an indicative position, and which lines need a closer look."
        note="Indicative, based on the information you provide. Not legal or tax advice."
      />
    </>
  );
}
