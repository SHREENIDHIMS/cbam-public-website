import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuideHeader } from '@/components/content/GuideHeader';
import { KeyFacts } from '@/components/content/KeyFacts';
import { RelatedGuides } from '@/components/content/RelatedGuides';
import { SourcePanel } from '@/components/content/SourcePanel';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { ButtonLink } from '@/components/shared/ButtonLink';
import { TrackOnMount } from '@/components/results/TrackOnMount';
import { JsonLd } from '@/components/shared/JsonLd';
import type { GuideSlug } from '@/lib/content/guide-slugs';
import { siteConfig } from '@/lib/config/site';
import { getGuideBySlug, getGuideSlugs, getRelatedGuides } from '@/lib/content/guides';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { OG_IMAGE_PATHS } from '@/lib/seo/og-paths';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getGuideSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  return buildMetadata({
    title: guide.frontmatter.title,
    description: guide.frontmatter.summary,
    path: `/guides/${slug}`,
    ogType: 'article',
    ogImage: OG_IMAGE_PATHS.guide(slug),
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const { frontmatter } = guide;
  const related = await getRelatedGuides(slug, 3);
  const url = absoluteUrl(`/guides/${slug}`);

  return (
    <>
      <TrackOnMount event={{ name: 'guide_open', properties: { slug: slug as GuideSlug } }} />
      <GuideHeader guide={frontmatter} />

      <PageContainer className="pt-4 pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <article aria-label="Guide text" className="min-w-0 lg:col-span-8">
            <div className="prose-cc">{guide.content}</div>
          </article>
          <aside
            aria-label="Key facts and sources"
            className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
          >
            <KeyFacts facts={frontmatter.keyFacts ?? []} />
            <SourcePanel sources={frontmatter.sources} rulesBasis={frontmatter.rulesBasis} />
          </aside>
        </div>
      </PageContainer>

      <Section tone="alt" spacing="compact" labelledBy="guide-cta-title">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="guide-cta-title" className="t-chapter">
              See where you stand.
            </h2>
            <p className="mt-3 text-ink-muted">
              Try your own figures. The tools are indicative, based on the information you provide,
              and show their working.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/exposure-check" size="lg">
              Check my exposure
            </ButtonLink>
            <ButtonLink href="/threshold-checker" variant="secondary" size="lg">
              Threshold checker
            </ButtonLink>
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section>
          <RelatedGuides guides={related} />
        </Section>
      ) : null}

      <JsonLd
        data={articleJsonLd({
          title: frontmatter.title,
          description: frontmatter.summary,
          url,
          reviewedAt: frontmatter.reviewedAt,
          publisherName: siteConfig.brandName,
          sources: frontmatter.sources,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Guides', url: absoluteUrl('/guides') },
          { name: frontmatter.title, url },
        ])}
      />
    </>
  );
}
