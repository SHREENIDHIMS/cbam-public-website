import { expect, test } from '@playwright/test';
import { FOOTER_GROUPS } from '../../lib/config/navigation';
import { expectNoSeriousA11yViolations } from './helpers/axe';

const NEW_ROUTES = [
  '/for-brokers',
  '/pricing',
  '/security',
  '/privacy',
  '/terms',
  '/data-processing',
] as const;

test.describe('axe on the conversion and trust routes', () => {
  for (const path of NEW_ROUTES) {
    test(`${path} has no serious accessibility violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoSeriousA11yViolations(page);
    });
  }
});

test.describe('broker contact form', () => {
  test('validates, then confirms in demo mode', async ({ page }) => {
    await page.goto('/for-brokers');
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Talk to us about your portfolio' }),
    ).toHaveAttribute('href', '#talk-to-us');
    await expect(page.getByText('Sample, illustrative')).toBeVisible();

    const form = page.getByRole('form', { name: 'Talk to us about your portfolio' });
    const consent = form.getByRole('checkbox', { name: /occasional updates/ });
    await expect(consent).not.toBeChecked();

    await form.getByRole('button', { name: 'Send request' }).click();
    await expect(form.getByText('Please check the form')).toBeVisible();
    await expect(form.getByText('Enter your name.').first()).toBeVisible();
    await expectNoSeriousA11yViolations(page);

    await form.getByLabel('Your name').fill('Ada Example');
    await form.getByLabel('Work email').fill('not-an-email');
    await form.getByRole('button', { name: 'Send request' }).click();
    await expect(form.getByText(/Enter a valid email address/).first()).toBeVisible();

    await form.getByLabel('Work email').fill('ada@example.co.uk');
    await form.getByRole('button', { name: 'Send request' }).click();

    const confirmation = page.getByTestId('contact-confirmation');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText('Thank you, we have your request.');
    await expect(confirmation).toContainText('demo mode');
    await expect(confirmation).toContainText('marketing');
    await expectNoSeriousA11yViolations(page);
  });
});

test.describe('pricing', () => {
  test('shows "Talk to us" and no number while prices are unapproved', async ({ page }) => {
    await page.goto('/pricing');
    const prices = page.getByTestId('plan-price');
    await expect(prices).toHaveCount(2);
    for (const price of await prices.all()) await expect(price).toHaveText('Talk to us');
    await expect(page.getByText('Prices are not set yet')).toBeVisible();
    await expect(page.getByRole('main').getByText(/£\d/)).toHaveCount(0);
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Check my exposure' }).first(),
    ).toHaveAttribute('href', '/exposure-check');
  });
});

test.describe('legal pages', () => {
  for (const path of ['/privacy', '/terms', '/data-processing'] as const) {
    test(`${path} shows the draft notice and entity placeholders`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText('Draft — pending legal review')).toBeVisible();
      await expect(page.getByText('[Legal entity — to confirm]').first()).toBeVisible();
    });
  }

  test('the security page makes no certification claim', async ({ page }) => {
    await page.goto('/security');
    await expect(page.getByText('We hold no security certification')).toBeVisible();
    await expect(page.getByText('Draft — pending legal review')).toHaveCount(0);
  });

  test('the privacy page lists cookies and the website sets none', async ({ page, context }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('region', { name: 'Cookies set by this website' })).toContainText(
      'None set',
    );
    await page.goto('/for-brokers');
    expect(await context.cookies()).toEqual([]);
    const stored = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    }));
    expect(stored).toEqual({ local: 0, session: 0 });
  });
});

test.describe('footer and header links', () => {
  test('resolve for the new pages', async ({ request }) => {
    const hrefs = FOOTER_GROUPS.flatMap((group) => group.items.map((item) => item.href)).filter(
      (href) => (NEW_ROUTES as readonly string[]).includes(href),
    );
    expect(hrefs.sort()).toEqual([...NEW_ROUTES].sort());
    for (const href of hrefs) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });
});
