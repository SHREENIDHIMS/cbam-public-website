import { CalendarCheck, Clock, Landmark } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { GUIDE_TOPIC_LABELS, type GuideFrontmatter } from '@/lib/content/guide-schema';
import { sectorLabel } from '@/lib/content/sector-label';
import { formatDate } from '@/lib/utils/format';

/** Title block for a guide: breadcrumb, headline, summary and the review and rules badges. */
export function GuideHeader({ guide }: { guide: GuideFrontmatter }) {
  const sectors = guide.sectors.map((sector) => sectorLabel(sector));
  return (
    <header className="border-b border-line bg-canvas">
      <PageContainer className="pt-10 pb-10 md:pt-14 md:pb-12">
        <Breadcrumbs
          items={[{ label: 'Guides', href: '/guides' }, { label: GUIDE_TOPIC_LABELS[guide.topic] }]}
        />
        <h1 className="t-chapter mt-6 max-w-[22ch]">{guide.title}</h1>
        <p className="t-lead mt-6">{guide.summary}</p>
        <ul className="t-figure m-0 mt-8 flex list-none flex-wrap gap-x-6 gap-y-3 border-t border-line p-0 pt-4 text-[0.8125rem] text-ink-muted">
          <li className="flex items-center gap-2">
            <CalendarCheck aria-hidden="true" className="size-4 text-primary" />
            Reviewed {formatDate(guide.reviewedAt)}
          </li>
          <li className="flex items-center gap-2">
            <Landmark aria-hidden="true" className="size-4 text-primary" />
            Rules basis: {guide.rulesBasis}
          </li>
          {guide.readingMinutes ? (
            <li className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-4 text-primary" />
              {guide.readingMinutes} minute read
            </li>
          ) : null}
          {sectors.length > 0 && sectors.length < 5 ? <li>{sectors.join(', ')}</li> : null}
        </ul>
      </PageContainer>
    </header>
  );
}
