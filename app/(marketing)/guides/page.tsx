import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { GuideFilters } from '@/components/content/GuideFilters';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { GUIDE_TOPIC_LABELS } from '@/lib/content/guide-schema';
import { getFeaturedGuides, getGuideList } from '@/lib/content/guides';
import { rules } from '@/lib/config/rules';
import { routeMetadata } from '@/lib/seo/metadata';
import { formatDate } from '@/lib/utils/format';

export const metadata = routeMetadata('/guides');

export default async function GuidesPage() {
  const [guides, featured] = await Promise.all([getGuideList(), getFeaturedGuides(1)]);
  const lead = featured[0];
  const sectors = rules.sectors.value ?? [];

  return (
    <>
      <PageHeader
        formLabel="Knowledge centre"
        title="Plain-English guides, with the sources alongside."
        lead="Each guide is dated, written from official GOV.UK and legislation.gov.uk pages, and says which rules snapshot it was checked against."
      />

      {lead ? (
        <section aria-labelledby="featured-guide-title" className="bg-canvas pb-12">
          <PageContainer>
            <div className="box relative grid grid-cols-1 gap-6 p-6 focus-within:shadow-md hover:shadow-md md:grid-cols-12 md:gap-10 md:p-10">
              <div className="min-w-0 md:col-span-8">
                <p className="t-label text-ink-subtle">
                  Start here · {GUIDE_TOPIC_LABELS[lead.topic]}
                </p>
                <h2 id="featured-guide-title" className="t-chapter mt-4">
                  <Link
                    href={`/guides/${lead.slug}` as Route}
                    className="no-underline after:absolute after:inset-0 after:content-[''] hover:text-primary"
                  >
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-4 max-w-xl text-lg text-ink-muted">{lead.summary}</p>
              </div>
              <div className="flex min-w-0 flex-col justify-end gap-3 md:col-span-4">
                <p className="text-sm text-ink-subtle">
                  Reviewed {formatDate(lead.reviewedAt)}
                  {lead.readingMinutes ? ` · ${lead.readingMinutes} minute read` : ''}
                </p>
                <p className="flex items-center gap-1.5 font-semibold text-primary">
                  Read the guide
                  <ArrowRight aria-hidden="true" className="size-4" />
                </p>
              </div>
            </div>
          </PageContainer>
        </section>
      ) : null}

      <section aria-labelledby="all-guides-title" className="bg-canvas pb-20 md:pb-28">
        <PageContainer>
          <h2 id="all-guides-title" className="t-chapter mb-8">
            All guides
          </h2>
          <GuideFilters guides={guides} sectors={sectors} />
        </PageContainer>
      </section>
    </>
  );
}
