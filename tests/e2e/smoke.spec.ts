import { expect, test } from '@playwright/test';
import { CENTRE_NAV, PRIMARY_CTA_LABEL, RIGHT_NAV } from '../../lib/config/navigation';
import { expectNoSeriousA11yViolations } from './helpers/axe';

test.describe('home', () => {
  test('renders the hero with a date-aware eyebrow and the primary CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/^UK CBAM · (live|in force since) /)).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: PRIMARY_CTA_LABEL }).first(),
    ).toBeVisible();
  });

  test('sends noindex and security headers outside production', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-powered-by']).toBeUndefined();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('has no serious accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expectNoSeriousA11yViolations(page);
  });
});

test.describe('desktop header', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop navigation only');
  });

  test('links resolve to pages', async ({ page, request }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const item of CENTRE_NAV) {
      await expect(nav.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
      const response = await request.get(item.href);
      expect(response.status(), item.href).toBe(200);
    }
    for (const item of RIGHT_NAV) {
      const response = await request.get(item.href);
      expect(response.status(), item.href).toBe(200);
    }
  });

  test('the primary CTA reads "Check my exposure" and navigates', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('banner').getByRole('link', { name: PRIMARY_CTA_LABEL });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/exposure-check$/);
  });
});

test.describe('mobile menu', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile navigation only');
  });

  test('opens and closes with the keyboard and keeps the CTA label', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: PRIMARY_CTA_LABEL })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('navigates from the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Guides' }).click();
    await expect(page).toHaveURL(/\/guides$/);
  });
});

test.describe('not found', () => {
  test('shows the branded 404 with working links', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();

    await page.getByRole('main').getByRole('link', { name: 'Read the guides' }).click();
    await expect(page).toHaveURL(/\/guides$/);

    await page.goto('/this-page-does-not-exist');
    await page.getByRole('main').getByRole('link', { name: PRIMARY_CTA_LABEL }).click();
    await expect(page).toHaveURL(/\/exposure-check$/);
  });

  test('has no serious accessibility violations', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expectNoSeriousA11yViolations(page);
  });
});

test.describe('discovery files', () => {
  test('robots disallows everything outside production', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /');
  });

  test('sitemap lists only built routes', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    expect(body).toContain('<loc>http://localhost:3100/</loc>');
    expect(body).toContain('/exposure-check');
    expect(body).toContain('/liability-preview');
    expect(body).not.toContain('/liability-preview/result');
    expect(body).toContain('/how-it-works');
    expect(body).toContain('/guides/what-is-uk-cbam');
  });
});
