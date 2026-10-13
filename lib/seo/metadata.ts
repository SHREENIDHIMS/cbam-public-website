import type { Metadata } from 'next';
import { publicEnv } from '@/lib/config/public-env';
import { siteConfig } from '@/lib/config/site';
import { getRoute, type PublicPath } from '@/lib/config/routes';
import { OG_IMAGE_PATHS, OG_SIZE, TOOL_OG, type OgToolKey } from './og-paths';

export const isProductionSite = publicEnv.NEXT_PUBLIC_SITE_ENV === 'production';

export function absoluteUrl(path: string, base: string = publicEnv.NEXT_PUBLIC_SITE_URL): string {
  return new URL(path, base).toString();
}

export interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  /** Path of the Open Graph image route. Defaults to the site image. */
  ogImage?: string;
}

/** Non-production deployments are noindex everywhere (DECISIONS 14). */
export function buildMetadata({
  title,
  description,
  path,
  noindex,
  ogType = 'website',
  ogImage = OG_IMAGE_PATHS.site,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const hidden = !isProductionSite || noindex === true;
  const image = { url: absoluteUrl(ogImage), ...OG_SIZE, alt: title };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.brandName,
      locale: 'en_GB',
      type: ogType,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    robots: hidden ? { index: false, follow: false } : { index: true, follow: true },
  };
}

function toolOgImage(path: PublicPath): string {
  const key = path.slice(1);
  return Object.hasOwn(TOOL_OG, key) ? OG_IMAGE_PATHS.tool(key as OgToolKey) : OG_IMAGE_PATHS.site;
}

/** Metadata for one of the public routes. Holding pages are noindex until built. */
export function routeMetadata(path: PublicPath): Metadata {
  const route = getRoute(path);
  return buildMetadata({
    title: route.title,
    description: route.description,
    path,
    noindex: route.noindex || !route.available,
    ogImage: toolOgImage(path),
  });
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${siteConfig.brandName}: ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  robots: isProductionSite ? { index: true, follow: true } : { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};
