import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GuideListItem } from '@/lib/content/guide-schema';
import { GuideCard } from './GuideCard';
import { Reveal } from './Reveal';

/** Featured guides on the homepage, read from content/guides by the page. */
export function GuideTeasers({ guides }: { guides: readonly GuideListItem[] }) {
  return (
    <>
      <ul className="m-0 mt-14 grid list-none gap-x-12 border-t border-line p-0 md:grid-cols-2">
        {guides.map((guide, index) => (
          <li key={guide.slug}>
            <Reveal delay={(index % 2) * 80} className="h-full">
              <GuideCard guide={guide} />
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/guides" className="link inline-flex items-center gap-2 font-semibold">
          Visit the knowledge centre
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </p>
    </>
  );
}
