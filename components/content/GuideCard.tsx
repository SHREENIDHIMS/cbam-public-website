import type { Route } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { GuideListItem } from '@/lib/content/guide-schema';
import { sectorLabelsOf } from '@/lib/content/guide-search';
import { GUIDE_TOPIC_LABELS } from '@/lib/content/guide-topics';
import { formatDateShort } from '@/lib/utils/format';

/** A guide as a ruled row. The whole row is one link (stretched title anchor). */
export function GuideCard({
  guide,
  headingLevel = 3,
}: {
  guide: GuideListItem;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const sectors = sectorLabelsOf(guide);
  return (
    <article className="group relative flex h-full flex-col border-b border-line py-7">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-subtle">
        <span className="t-label">{GUIDE_TOPIC_LABELS[guide.topic]}</span>
        <span aria-hidden="true">·</span>
        <span className="t-figure text-[0.8125rem]">
          Reviewed {formatDateShort(guide.reviewedAt)}
        </span>
      </p>
      <Heading className="t-title mt-3">
        <Link
          href={`/guides/${guide.slug}` as Route}
          className="no-underline decoration-2 underline-offset-[0.2em] group-hover:text-primary group-hover:underline after:absolute after:inset-0 after:content-['']"
        >
          {guide.title}
        </Link>
      </Heading>
      <p className="mt-3 max-w-md text-ink-muted">{guide.summary}</p>
      {sectors.length > 0 && sectors.length < 5 ? (
        <p className="mt-3 text-sm text-ink-subtle">{sectors.join(', ')}</p>
      ) : sectors.length > 0 ? (
        <p className="mt-3 text-sm text-ink-subtle">All five sectors</p>
      ) : null}
      <p className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary">
        Read the guide
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </p>
    </article>
  );
}
