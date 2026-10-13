import { expect, test, type Page } from '@playwright/test';
import { PRIMARY_CTA_LABEL } from '../../lib/config/navigation';
import { expectNoSeriousA11yViolations } from './helpers/axe';

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  });
}

test.describe('homepage', () => {
  test('the hero CTA goes to /exposure-check and the secondary goes to /how-it-works', async ({
    page,
  }) => {
    await page.goto('/');
    const hero = page.getByRole('region', { name: /Know what is covered/ });
    await hero.getByRole('link', { name: PRIMARY_CTA_LABEL }).click();
    await expect(page).toHaveURL(/\/exposure-check$/);

    await page.goto('/');
    await page.getByRole('main').getByRole('link', { name: 'See how it works' }).click();
    await expect(page).toHaveURL(/\/how-it-works$/);
  });

  test('the final CTA and broker link resolve', async ({ page }) => {
    await page.goto('/');
    const finalCta = page.getByRole('region', { name: 'Find out where you stand.' });
    await finalCta.scrollIntoViewIfNeeded();
    await expect(finalCta.getByRole('link', { name: PRIMARY_CTA_LABEL })).toHaveAttribute(
      'href',
      '/exposure-check',
    );
    await expect(page.getByRole('link', { name: /Explore the broker view/ })).toHaveAttribute(
      'href',
      '/for-brokers',
    );
  });

  test('shows facts with their official status and labels the sample visuals', async ({ page }) => {
    await page.goto('/');
    const facts = page.getByRole('region', { name: /key facts/i });
    await expect(facts.getByText('Official', { exact: true })).toHaveCount(4);
    await expect(facts.getByText('£50,000')).toBeVisible();
    await expect(page.getByText(/Sample data · fictional importer/)).toBeVisible();
  });

  test('has no serious accessibility violations after the page has been scrolled', async ({
    page,
  }) => {
    await page.goto('/');
    await scrollThrough(page);
    await page.waitForTimeout(700);
    await expectNoSeriousA11yViolations(page);
  });

  test('has no serious accessibility violations with an FAQ answer open', async ({ page }) => {
    await page.goto('/');
    await page.locator('details summary').first().click();
    await scrollThrough(page);
    await page.waitForTimeout(700);
    await expectNoSeriousA11yViolations(page);
  });

  test('does not scroll horizontally', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test('exposes valid FAQPage JSON-LD matching the visible questions', async ({ page }) => {
    await page.goto('/');
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json ?? '{}') as {
      '@type': string;
      mainEntity: Array<{ name: string }>;
    };
    expect(data['@type']).toBe('FAQPage');
    const visible = await page.locator('details summary').allTextContents();
    expect(data.mainEntity.map((entry) => entry.name)).toEqual(visible.map((q) => q.trim()));
  });

  test('has page metadata with a canonical URL and Open Graph tags', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Understand your UK CBAM exposure \| /);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /UK CBAM/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^http:\/\/localhost:3100\/?$/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /Understand your UK CBAM exposure/,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      /^http:\/\/localhost:3100\/?$/,
    );
  });
});

test.describe('FAQ keyboard operation', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Keyboard interaction');
  });

  test('opens and closes with Enter and Space and exposes the figures from rules', async ({
    page,
  }) => {
    await page.goto('/');
    const summary = page.locator('details summary', {
      hasText: 'Does the registration threshold apply to every import?',
    });
    const item = summary.locator('xpath=..');
    await summary.focus();
    await expect(summary).toBeFocused();
    await expect(item).not.toHaveAttribute('open', '');

    await page.keyboard.press('Enter');
    await expect(item).toHaveAttribute('open', '');
    await expect(item.getByText(/£50,000 over 12 months/)).toBeVisible();

    await page.keyboard.press('Space');
    await expect(item).not.toHaveAttribute('open', '');
  });

  test('Tab moves from one question to the next', async ({ page }) => {
    await page.goto('/');
    const summaries = page.locator('details summary');
    await summaries.first().focus();
    await page.keyboard.press('Tab');
    await expect(summaries.nth(1)).toBeFocused();
  });
});

test.describe('reduced motion', () => {
  test('leaves all content visible and unanimated', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Why is this the number?' })).toBeVisible();
  });
});
