// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { currentRulesVersion } from '@/lib/config/rules';
import { isPrimarySourceUrl } from '@/lib/config/rules-schema';
import { SECTOR_CONTENT } from '@/lib/config/sectors';
import { guideFrontmatterSchema } from '@/lib/content/guide-schema';
import {
  getAllGuides,
  getFeaturedGuides,
  getGuideBySlug,
  getGuideList,
  getRelatedGuides,
} from '@/lib/content/guides';
import { isRuleDisplayKey } from '@/lib/utils/rules-display';

const GUIDES_DIR = join(process.cwd(), 'content', 'guides');
const files = readdirSync(GUIDES_DIR).filter((name) => name.endsWith('.mdx'));

describe('guide content', () => {
  it('ships at least five complete guides', async () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
    expect((await getGuideList()).length).toBe(files.length);
  });

  it('validates every guide frontmatter, rules basis and primary sources', async () => {
    for (const guide of await getAllGuides()) {
      const fm = guideFrontmatterSchema.parse(guide.frontmatter);
      expect(fm.rulesBasis).toBe(currentRulesVersion);
      expect(fm.sources.length).toBeGreaterThanOrEqual(1);
      for (const source of fm.sources) expect(isPrimarySourceUrl(source.url)).toBe(true);
      for (const fact of fm.keyFacts ?? []) {
        if (fact.rule) expect(isRuleDisplayKey(fact.rule), `${fm.slug}: ${fact.rule}`).toBe(true);
      }
    }
  });

  it('never types a pound amount in a guide body', () => {
    for (const file of files) {
      const raw = readFileSync(join(GUIDES_DIR, file), 'utf8');
      const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
      expect(body, file).not.toMatch(/£\s?\d/);
    }
  });

  it('has related guides that exist and returns null for an unknown slug', async () => {
    const list = await getGuideList();
    for (const { slug } of list) {
      const related = await getRelatedGuides(slug, 3);
      expect(related.length).toBeGreaterThan(0);
      expect(related.map((guide) => guide.slug)).not.toContain(slug);
    }
    expect(await getGuideBySlug('does-not-exist')).toBeNull();
  });

  it('features guides for the homepage', async () => {
    const featured = await getFeaturedGuides(4);
    expect(featured.length).toBe(4);
    expect(featured.every((guide) => guide.featured)).toBe(true);
  });

  it('covers the five requested topics', async () => {
    const slugs = (await getGuideList()).map((guide) => guide.slug);
    for (const slug of [
      'what-is-uk-cbam',
      'how-the-registration-threshold-works',
      'commodity-codes-and-scope',
      'supplier-emissions-data',
      'carbon-price-relief-explained',
    ]) {
      expect(slugs).toContain(slug);
    }
  });

  it('points every sector at a guide that exists', async () => {
    const slugs = (await getGuideList()).map((guide) => guide.slug);
    for (const content of Object.values(SECTOR_CONTENT)) {
      expect(slugs).toContain(content.relatedGuide);
    }
  });
});
