import 'server-only';
import { rules } from '@/lib/config/rules';
import { getGuideBySlug, getGuideList, toListItem } from '@/lib/content/guides';
import { ApiError } from './errors';
import { guideIndexSchema, guideSchema, type DataSource } from './schemas';
import type { PublicApiAdapter } from './types';

/** Guides are local content (content/guides), so both adapters serve them the same way. */
export function buildGuideMethods(
  dataSource: DataSource,
): Pick<PublicApiAdapter, 'getGuideIndex' | 'getGuide'> {
  return {
    async getGuideIndex() {
      return guideIndexSchema.parse({
        rulesVersion: rules.rulesVersion,
        dataSource,
        guides: await getGuideList(),
      });
    },
    async getGuide(slug) {
      const guide = await getGuideBySlug(slug);
      if (!guide) throw new ApiError('not_found', 'getGuide');
      return guideSchema.parse({
        rulesVersion: rules.rulesVersion,
        dataSource,
        guide: { ...toListItem(guide.frontmatter), body: guide.source },
      });
    },
  };
}
