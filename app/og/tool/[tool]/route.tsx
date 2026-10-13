import { notFound } from 'next/navigation';
import { renderOgImage } from '@/lib/seo/og-image';
import { TOOL_OG, type OgToolKey } from '@/lib/seo/og-paths';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TOOL_OG).map((tool) => ({ tool }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  if (!Object.hasOwn(TOOL_OG, tool)) notFound();
  const entry = TOOL_OG[tool as OgToolKey];
  return renderOgImage('tool', entry.title, entry.subtitle);
}
