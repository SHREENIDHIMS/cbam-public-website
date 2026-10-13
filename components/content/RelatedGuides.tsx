import type { GuideListItem } from '@/lib/content/guide-schema';
import { GuideCard } from './GuideCard';

export function RelatedGuides({
  guides,
  headingId = 'related-title',
}: {
  guides: readonly GuideListItem[];
  headingId?: string;
}) {
  if (guides.length === 0) return null;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="t-chapter">
        Related guides
      </h2>
      <ul className="m-0 mt-10 grid list-none gap-x-12 border-t-2 border-ink p-0 md:grid-cols-3">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <GuideCard guide={guide} />
          </li>
        ))}
      </ul>
    </section>
  );
}
