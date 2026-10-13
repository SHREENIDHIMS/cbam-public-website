import { expect, test, type Page } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './helpers/axe';

async function answer(page: Page) {
  await page.getByLabel('£25,000 to £50,000').check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Iron and steel').check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('China').check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('2 to 5 suppliers').check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/No, imports are fairly steady/).check({ force: true });
  await page.getByRole('button', { name: 'See my estimate' }).click();
}

test.describe('quick estimate', () => {
  test('completes five steps and shows a result that survives a reload', async ({ page }) => {
    await page.goto('/quick-estimate');
    await expectNoSeriousA11yViolations(page);
    await answer(page);
    await expect(page).toHaveURL(
      /\/quick-estimate\/result\?v=1&value=25k_50k&sectors=iron_steel&origins=china&suppliers=2_5&large=no/,
    );
    await expect(page.getByText('Approaching threshold').first()).toBeVisible();
    await expect(page.getByText('Demo data')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print this result' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expectNoSeriousA11yViolations(page);

    await page.reload();
    await expect(page.getByText('Approaching threshold').first()).toBeVisible();
  });

  test('blocks an empty step with an error summary and focuses the heading on advance', async ({
    page,
  }) => {
    await page.goto('/quick-estimate');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'There is a problem' })).toBeFocused();
    await page.getByLabel('Under £25,000').check({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Which sectors are relevant?' }),
    ).toBeFocused();
  });

  test('an unreadable link shows the not-enough-information state', async ({ page }) => {
    await page.goto('/quick-estimate/result?value=bogus');
    await expect(page.getByText('Not enough information for a reliable view yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start the quick estimate' })).toBeVisible();
  });

  test('Change answers pre-fills the wizard', async ({ page }) => {
    await page.goto('/quick-estimate');
    await answer(page);
    await page.getByRole('link', { name: 'Change answers' }).click();
    await expect(page.getByLabel('£25,000 to £50,000')).toBeChecked();
  });
});
