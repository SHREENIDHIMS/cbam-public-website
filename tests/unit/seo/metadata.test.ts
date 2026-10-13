import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadMetadata(env: 'production' | 'development') {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SITE_ENV', env);
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.test');
  vi.stubEnv('NEXT_PUBLIC_CBAM_APP_URL', 'https://app.example.test');
  return import('@/lib/seo/metadata');
}

afterEach(() => vi.unstubAllEnvs());

describe('buildMetadata', () => {
  it('sets title, description, canonical, Open Graph and index in production', async () => {
    const { buildMetadata } = await loadMetadata('production');
    const meta = buildMetadata({
      title: 'T',
      description: 'D',
      path: '/guides/x',
      ogType: 'article',
    });
    expect(meta.title).toBe('T');
    expect(meta.description).toBe('D');
    expect(meta.alternates?.canonical).toBe('https://example.test/guides/x');
    expect(meta.openGraph).toMatchObject({
      title: 'T',
      description: 'D',
      url: 'https://example.test/guides/x',
      type: 'article',
      locale: 'en_GB',
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: 'https://example.test/og/site', width: 1200, height: 630 }],
    });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('uses a per-type image for tool routes', async () => {
    const { routeMetadata } = await loadMetadata('production');
    expect(routeMetadata('/liability-preview').openGraph).toMatchObject({
      images: [{ url: 'https://example.test/og/tool/liability-preview' }],
    });
    expect(routeMetadata('/pricing').openGraph).toMatchObject({
      images: [{ url: 'https://example.test/og/site' }],
    });
  });

  it('is noindex for result pages in production and for every page elsewhere', async () => {
    const production = await loadMetadata('production');
    expect(
      production.buildMetadata({ title: 'T', description: 'D', path: '/r', noindex: true }).robots,
    ).toEqual({ index: false, follow: false });
    const development = await loadMetadata('development');
    expect(development.buildMetadata({ title: 'T', description: 'D', path: '/' }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe('robots and sitemap', () => {
  it('robots disallows everything outside production and points at the sitemap in production', async () => {
    await loadMetadata('development');
    const dev = (await import('@/app/robots')).default();
    expect(dev.rules).toEqual({ userAgent: '*', disallow: '/' });
    await loadMetadata('production');
    const prod = (await import('@/app/robots')).default();
    expect(prod.sitemap).toBe('https://example.test/sitemap.xml');
  });

  it('the sitemap lists absolute URLs and never a result page', async () => {
    await loadMetadata('production');
    const entries = await (await import('@/app/sitemap')).default();
    expect(entries.length).toBeGreaterThan(10);
    for (const entry of entries) {
      expect(entry.url.startsWith('https://example.test/')).toBe(true);
      expect(entry.url).not.toContain('/result');
    }
  });
});
