import { notFound } from 'next/navigation';
import { getGuideBySlug, getGuideSlugs } from '@/lib/content/guides';
import { renderOgImage } from '@/lib/seo/og-image';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getGuideSlugs()).map((slug) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();
  return renderOgImage('guide', guide.frontmatter.title, guide.frontmatter.summary);
}
