import { z } from 'zod';
import { isPrimarySourceUrl, SECTOR_KEYS } from '@/lib/config/rules-schema';

import { GUIDE_TOPICS, GUIDE_TOPIC_LABELS, type GuideTopic } from './guide-topics';

export { GUIDE_TOPICS, GUIDE_TOPIC_LABELS, type GuideTopic };

/** Frontmatter for a guide in content/guides/<slug>.mdx (DECISIONS 10). */

const isoDate = z.iso.date();

export const guideSourceSchema = z.object({
  title: z.string().min(1),
  url: z.url().refine(isPrimarySourceUrl, 'Guide sources must be on gov.uk or legislation.gov.uk.'),
  accessedAt: isoDate,
});
export type GuideSource = z.infer<typeof guideSourceSchema>;

export const guideKeyFactSchema = z
  .object({
    label: z.string().min(1),
    /** A key of lib/config/rules.ts, so the figure is interpolated and never typed. */
    rule: z.string().min(1).optional(),
    /** Plain text for facts that are not regulatory values. */
    text: z.string().min(1).optional(),
  })
  .refine((fact) => (fact.rule ? !fact.text : Boolean(fact.text)), {
    message: 'A key fact needs either a rule key or text, not both.',
  });
export type GuideKeyFact = z.infer<typeof guideKeyFactSchema>;

export const guideFrontmatterSchema = z.object({
  title: z.string().min(1).max(110),
  summary: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sectors: z.array(z.enum(SECTOR_KEYS)),
  topic: z.enum(GUIDE_TOPICS),
  tags: z.array(z.string().min(1)).min(1),
  reviewedAt: isoDate,
  rulesBasis: z.string().min(1),
  sources: z.array(guideSourceSchema).min(1),
  featured: z.boolean().optional(),
  /** Order among featured guides: 1 is shown first. */
  featuredRank: z.number().int().positive().optional(),
  keyFacts: z.array(guideKeyFactSchema).optional(),
  related: z.array(z.string()).optional(),
  readingMinutes: z.number().int().positive().optional(),
});
export type GuideFrontmatter = z.infer<typeof guideFrontmatterSchema>;

/** The slim record the guides index and the filter island work from. */
export const guideListItemSchema = guideFrontmatterSchema.pick({
  slug: true,
  title: true,
  summary: true,
  topic: true,
  sectors: true,
  tags: true,
  reviewedAt: true,
  featured: true,
  featuredRank: true,
  readingMinutes: true,
});
export type GuideListItem = z.infer<typeof guideListItemSchema> & {
  /** Display names for `sectors`, resolved on the server so the browser needs no rules module. */
  sectorLabels?: readonly string[];
};
