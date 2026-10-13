import type { MetadataRoute } from 'next';
import { SITEMAP_ROUTES } from '@/lib/config/routes';
import { rules } from '@/lib/config/rules';
import { getGuideList } from '@/lib/content/guides';
import { absoluteUrl } from '@/lib/seo/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await getGuideList();
  return [
    ...SITEMAP_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: rules.reviewedAt,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...guides.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: guide.reviewedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
