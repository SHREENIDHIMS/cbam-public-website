import type { MetadataRoute } from 'next';
import { absoluteUrl, isProductionSite } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
