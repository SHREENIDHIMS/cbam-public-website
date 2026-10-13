import 'server-only';
import { cache, type ReactElement } from 'react';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { currentRulesVersion } from '@/lib/config/rules';
import { guideFrontmatterSchema, type GuideFrontmatter, type GuideListItem } from './guide-schema';
import { sectorLabel } from './sector-label';
import { guideMdxComponents } from '@/components/content/mdx';

/** Reads content/guides/*.mdx. Frontmatter is validated; a bad guide fails the build. */

const GUIDES_DIR = join(process.cwd(), 'content', 'guides');

export interface LoadedGuide {
  frontmatter: GuideFrontmatter;
  /** Raw MDX source after the frontmatter. */
  source: string;
  content: ReactElement;
}

const loadAll = cache(async (): Promise<LoadedGuide[]> => {
  const files = (await readdir(GUIDES_DIR)).filter((name) => name.endsWith('.mdx')).sort();
  const loaded = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(GUIDES_DIR, file), 'utf8');
      const compiled = await compileMDX<Record<string, unknown>>({
        source: raw,
        // Guides are repo-authored and reviewed, so JSX props such as the DataTable rows may be
        // expressions. Dangerous globals (eval, Function, process) stay blocked.
        options: { parseFrontmatter: true, blockJS: false },
        components: guideMdxComponents,
      });
      const frontmatter = guideFrontmatterSchema.parse(compiled.frontmatter);
      const slug = file.replace(/\.mdx$/, '');
      if (frontmatter.slug !== slug) {
        throw new Error(
          `Guide ${file}: frontmatter slug "${frontmatter.slug}" must equal the filename.`,
        );
      }
      if (frontmatter.rulesBasis !== currentRulesVersion) {
        throw new Error(
          `Guide ${file}: rulesBasis "${frontmatter.rulesBasis}" is not the current rules version.`,
        );
      }
      const source = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
      return { frontmatter, source, content: compiled.content } satisfies LoadedGuide;
    }),
  );
  const slugs = loaded.map((guide) => guide.frontmatter.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate guide slug.');
  for (const guide of loaded) {
    for (const related of guide.frontmatter.related ?? []) {
      if (!slugs.includes(related)) {
        throw new Error(
          `Guide ${guide.frontmatter.slug}: related guide "${related}" does not exist.`,
        );
      }
    }
  }
  return loaded;
});

export function toListItem(frontmatter: GuideFrontmatter): GuideListItem {
  const {
    slug,
    title,
    summary,
    topic,
    sectors,
    tags,
    reviewedAt,
    featured,
    featuredRank,
    readingMinutes,
  } = frontmatter;
  return {
    slug,
    title,
    summary,
    topic,
    sectors,
    tags,
    reviewedAt,
    sectorLabels: sectors.map((sector) => sectorLabel(sector)),
    ...(featured ? { featured } : {}),
    ...(featuredRank ? { featuredRank } : {}),
    ...(readingMinutes ? { readingMinutes } : {}),
  };
}

export async function getAllGuides(): Promise<LoadedGuide[]> {
  return loadAll();
}

export async function getGuideList(): Promise<GuideListItem[]> {
  return (await loadAll())
    .map((guide) => toListItem(guide.frontmatter))
    .sort(
      (a, b) =>
        b.reviewedAt.localeCompare(a.reviewedAt) ||
        (a.featuredRank ?? 99) - (b.featuredRank ?? 99) ||
        a.title.localeCompare(b.title),
    );
}

export async function getFeaturedGuides(limit = 4): Promise<GuideListItem[]> {
  const list = await getGuideList();
  const featured = list
    .filter((guide) => guide.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
  return (featured.length > 0 ? featured : list).slice(0, limit);
}

export async function getGuideBySlug(slug: string): Promise<LoadedGuide | null> {
  return (await loadAll()).find((guide) => guide.frontmatter.slug === slug) ?? null;
}

export async function getGuideSlugs(): Promise<string[]> {
  return (await loadAll()).map((guide) => guide.frontmatter.slug);
}

/** Related guides: explicit `related` first, then same topic, then shared sectors. */
export async function getRelatedGuides(slug: string, limit = 3): Promise<GuideListItem[]> {
  const all = await loadAll();
  const current = all.find((guide) => guide.frontmatter.slug === slug);
  if (!current) return [];
  const explicit = current.frontmatter.related ?? [];
  const score = (guide: LoadedGuide): number => {
    const fm = guide.frontmatter;
    if (explicit.includes(fm.slug)) return 100 - explicit.indexOf(fm.slug);
    let value = 0;
    if (fm.topic === current.frontmatter.topic) value += 10;
    value += fm.sectors.filter((sector) => current.frontmatter.sectors.includes(sector)).length;
    return value;
  };
  return all
    .filter((guide) => guide.frontmatter.slug !== slug)
    .sort((a, b) => score(b) - score(a) || a.frontmatter.title.localeCompare(b.frontmatter.title))
    .slice(0, limit)
    .map((guide) => toListItem(guide.frontmatter));
}
