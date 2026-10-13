import { siteConfig } from '@/lib/config/site';
import { renderOgImage } from '@/lib/seo/og-image';

export function GET() {
  return renderOgImage(
    'site',
    siteConfig.tagline,
    'Check your UK CBAM exposure and see how the numbers are reached.',
  );
}
