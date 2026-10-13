import type { SectorKey } from '@/lib/config/rules-schema';
import type { GuideListItem } from './guide-schema';
import { GUIDE_TOPIC_LABELS, type GuideTopic } from './guide-topics';

/** In-memory guide search and filters (MASTER_PROMPT 32). Pure, so it runs on server and client. */

export const RECENT_DAYS = 90;

export interface GuideFilterState {
  query: string;
  sector: SectorKey | 'all';
  topic: GuideTopic | 'all';
  recent: boolean;
}

export const DEFAULT_FILTERS: GuideFilterState = {
  query: '',
  sector: 'all',
  topic: 'all',
  recent: false,
};

/** Sector names for a guide: resolved labels when present, otherwise the keys. */
export function sectorLabelsOf(guide: GuideListItem): readonly string[] {
  return guide.sectorLabels ?? guide.sectors;
}

function haystack(guide: GuideListItem): string {
  return [
    guide.title,
    guide.summary,
    GUIDE_TOPIC_LABELS[guide.topic],
    ...sectorLabelsOf(guide),
    ...guide.tags,
  ]
    .join(' ')
    .toLowerCase();
}

function tokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9£]+/)
    .filter(Boolean);
}

export function isRecent(reviewedAt: string, today: Date, days = RECENT_DAYS): boolean {
  const reviewed = new Date(`${reviewedAt}T00:00:00Z`).getTime();
  const ageDays = (today.getTime() - reviewed) / 86_400_000;
  return ageDays <= days;
}

/** Every search word must appear in the title, summary, topic, sector or tags. */
export function filterGuides(
  guides: readonly GuideListItem[],
  state: GuideFilterState,
  today: Date = new Date(),
): GuideListItem[] {
  const words = tokens(state.query);
  return guides
    .filter((guide) => {
      if (state.sector !== 'all' && !guide.sectors.includes(state.sector)) return false;
      if (state.topic !== 'all' && guide.topic !== state.topic) return false;
      if (state.recent && !isRecent(guide.reviewedAt, today)) return false;
      if (words.length === 0) return true;
      const text = haystack(guide);
      return words.every((word) => text.includes(word));
    })
    .sort(
      (a, b) =>
        b.reviewedAt.localeCompare(a.reviewedAt) ||
        (a.featuredRank ?? 99) - (b.featuredRank ?? 99) ||
        a.title.localeCompare(b.title),
    );
}
