import { expect, test, type Page } from '@playwright/test';
import { PUBLIC_PATHS } from '../../lib/config/routes';
import { expectNoSeriousA11yViolations } from './helpers/axe';

/** Every public route: valid response, SEO head, structured data, and an axe scan. */

const BASE = 'http://localhost:3100';
const GUIDE_SLUGS = [
  'carbon-price-relief-explained',
  'commodity-codes-and-scope',
  'how-the-registration-threshold-works',
];
const RESULT_ROUTES = [
  '/quick-estimate/result?v=1&value=25k_50k&sectors=iron_steel&origins=china&suppliers=2_5&large=no',
  '/liability-preview/result/unknown-session',
] as const;

async function meta(page: Page, selector: string, attribute = 'content') {
  return page.locator(selector).first().getAttribute(attribute);
}

/** Links that open a new tab must not hand the opener to the destination. */
async function expectExternalLinksSafe(page: Page) {
  const unsafe = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'))
      .filter((a) => {
        const rel = a.rel.split(/\s+/);
        return !(rel.includes('noopener') && rel.includes('noreferrer'));
      })
      .map((a) => a.href),
  );
  expect(unsafe, 'new-tab links without rel="noopener noreferrer"').toEqual([]);
}

test.describe('public routes', () => {
  const paths = [...PUBLIC_PATHS, ...GUIDE_SLUGS.map((slug) => `/guides/${slug}`)];

  for (const path of paths) {
    test(`${path} responds, has complete metadata and passes axe`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
      const description = await meta(page, 'meta[name="description"]');
      expect(description?.length ?? 0).toBeGreaterThan(30);

      const canonical = await meta(page, 'link[rel="canonical"]', 'href');
      expect(canonical).toBe(path === '/' ? BASE : `${BASE}${path}`);
      expect(await meta(page, 'meta[property="og:title"]')).toBeTruthy();
      expect(await meta(page, 'meta[property="og:description"]')).toBeTruthy();
      expect(await meta(page, 'meta[property="og:url"]')).toBe(canonical);
      const image = await meta(page, 'meta[property="og:image"]');
      expect(image, 'og:image').toBeTruthy();
      expect(await meta(page, 'meta[name="robots"]')).toMatch(/noindex/);

      await expect(page.locator('h1')).toHaveCount(1);
      await expectExternalLinksSafe(page);
      await expectNoSeriousA11yViolations(page);
    });
  }

  test('Open Graph images are PNGs', async ({ page, request }) => {
    for (const path of ['/', '/exposure-check', `/guides/${GUIDE_SLUGS[0]}`]) {
      await page.goto(path);
      const image = await meta(page, 'meta[property="og:image"]');
      const response = await request.get(new URL(image ?? '', BASE).toString());
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type'], path).toContain('image/png');
    }
  });

  for (const route of RESULT_ROUTES) {
    test(`${route.split('?')[0]} is noindex and passes axe`, async ({ page }) => {
      await page.goto(route);
      expect(await meta(page, 'meta[name="robots"]')).toMatch(/noindex/);
      await expect(page.locator('h1')).toHaveCount(1);
      await expectNoSeriousA11yViolations(page);
    });
  }
});

test.describe('structured data', () => {
  async function blocks(page: Page): Promise<Array<Record<string, unknown>>> {
    const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
    return texts.map((text) => JSON.parse(text) as Record<string, unknown>);
  }

  test('the home page has FAQPage and Organization data', async ({ page }) => {
    await page.goto('/');
    const types = (await blocks(page)).map((block) => block['@type']);
    expect(types).toContain('FAQPage');
    expect(types).toContain('Organization');
    const faq = (await blocks(page)).find((block) => block['@type'] === 'FAQPage');
    const questions = faq?.['mainEntity'] as Array<{ name: string }>;
    for (const question of questions.slice(0, 3)) {
      await expect(page.getByText(question.name).first()).toBeVisible();
    }
  });

  test('a guide has Article and BreadcrumbList data', async ({ page }) => {
    await page.goto(`/guides/${GUIDE_SLUGS[2]}`);
    const found = await blocks(page);
    const article = found.find((block) => block['@type'] === 'Article');
    expect(article?.['headline']).toBeTruthy();
    expect(article?.['dateModified']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const crumbs = found.find((block) => block['@type'] === 'BreadcrumbList');
    expect((crumbs?.['itemListElement'] as unknown[]).length).toBeGreaterThanOrEqual(2);
  });
});

test.describe('focus and motion', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Keyboard focus on desktop');
  });

  test('Tab shows a visible focus indicator on links, buttons and fields', async ({ page }) => {
    for (const path of ['/', '/quick-estimate', '/for-brokers']) {
      await page.goto(path);
      const seen = new Set<string>();
      for (let step = 0; step < 14; step += 1) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          const visible =
            (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2) ||
            style.boxShadow !== 'none';
          return { tag: el.tagName.toLowerCase(), visible };
        });
        if (!info) continue;
        seen.add(info.tag);
        expect(info.visible, `${path}: focused <${info.tag}> has no visible focus style`).toBe(
          true,
        );
      }
      expect(seen.size, path).toBeGreaterThan(0);
    }
  });

  test('reduced motion removes transitions and animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of ['/', '/liability-preview', '/guides']) {
      await page.goto(path);
      const offenders = await page.evaluate(() => {
        const found: string[] = [];
        for (const el of Array.from(document.querySelectorAll('body *')).slice(0, 600)) {
          const style = getComputedStyle(el);
          const longest = (value: string) =>
            Math.max(...value.split(',').map((part) => parseFloat(part) || 0));
          if (longest(style.transitionDuration) > 0.05 || longest(style.animationDuration) > 0.05) {
            found.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
          }
        }
        return found;
      });
      expect(offenders, path).toEqual([]);
    }
  });
});
