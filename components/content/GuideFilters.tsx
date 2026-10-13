'use client';

import { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { SectorKey } from '@/lib/config/rules-schema';
import type { GuideListItem } from '@/lib/content/guide-schema';
import { GUIDE_TOPICS, GUIDE_TOPIC_LABELS, type GuideTopic } from '@/lib/content/guide-topics';
import {
  DEFAULT_FILTERS,
  RECENT_DAYS,
  filterGuides,
  type GuideFilterState,
} from '@/lib/content/guide-search';
import { GuideCard } from './GuideCard';

const fieldClass =
  'h-11 w-full rounded-sm border border-line-strong bg-surface px-3 text-base text-ink focus-visible:border-primary';

/**
 * Search and filters for the guide library. The server passes a slim index and this island filters
 * it in memory (DECISIONS 10); with JavaScript off the full list is still rendered.
 */
export function GuideFilters({
  guides,
  sectors,
}: {
  guides: readonly GuideListItem[];
  sectors: ReadonlyArray<{ key: SectorKey; label: string }>;
}) {
  const [filters, setFilters] = useState<GuideFilterState>(DEFAULT_FILTERS);
  const searchId = useId();
  const sectorId = useId();
  const topicId = useId();
  const recentId = useId();

  const results = useMemo(() => filterGuides(guides, filters), [guides, filters]);
  const active =
    filters.query !== '' || filters.sector !== 'all' || filters.topic !== 'all' || filters.recent;

  return (
    <div>
      <form
        role="search"
        aria-label="Search guides"
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-1 gap-5 rounded-sm border border-line bg-surface p-5 shadow-sm md:grid-cols-12 md:p-6"
      >
        <div className="md:col-span-12">
          <label htmlFor={searchId} className="mb-1.5 block text-sm font-semibold text-ink">
            Search guides
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-subtle"
            />
            <input
              id={searchId}
              type="search"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="For example: threshold, suppliers, commodity code"
              autoComplete="off"
              className={`${fieldClass} pl-10`}
            />
          </div>
        </div>
        <div className="md:col-span-4">
          <label htmlFor={sectorId} className="mb-1.5 block text-sm font-semibold text-ink">
            Sector
          </label>
          <select
            id={sectorId}
            value={filters.sector}
            onChange={(event) =>
              setFilters({ ...filters, sector: event.target.value as GuideFilterState['sector'] })
            }
            className={fieldClass}
          >
            <option value="all">All sectors</option>
            {sectors.map((sector) => (
              <option key={sector.key} value={sector.key}>
                {sector.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <label htmlFor={topicId} className="mb-1.5 block text-sm font-semibold text-ink">
            Topic
          </label>
          <select
            id={topicId}
            value={filters.topic}
            onChange={(event) =>
              setFilters({ ...filters, topic: event.target.value as GuideTopic | 'all' })
            }
            className={fieldClass}
          >
            <option value="all">All topics</option>
            {GUIDE_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {GUIDE_TOPIC_LABELS[topic]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end md:col-span-4">
          <label
            htmlFor={recentId}
            className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink"
          >
            <input
              id={recentId}
              type="checkbox"
              checked={filters.recent}
              onChange={(event) => setFilters({ ...filters, recent: event.target.checked })}
              className="size-5 accent-[var(--cc-primary)]"
            />
            Reviewed in the last {RECENT_DAYS} days
          </label>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-ink-muted">
          {results.length === 1 ? '1 guide' : `${results.length} guides`}
          {active ? (results.length === 1 ? ' matches your search' : ' match your search') : ''}
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="link min-h-11 rounded-sm px-3 text-sm font-semibold"
          >
            Clear search and filters
          </button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <ul className="m-0 mt-2 grid list-none gap-x-12 p-0 md:grid-cols-2">
          {results.map((guide) => (
            <li key={guide.slug}>
              <GuideCard guide={guide} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-sm border border-dashed border-line-strong p-8 text-center">
          <p className="text-lg font-semibold text-ink">No guides match that search.</p>
          <p className="mt-2 text-ink-muted">
            Try fewer words, or clear the filters to see every guide.
          </p>
        </div>
      )}
    </div>
  );
}
