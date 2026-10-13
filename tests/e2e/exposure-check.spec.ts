import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './helpers/axe';

test.describe('exposure check', () => {
  test('offers both paths and links to the tools', async ({ page }) => {
    await page.goto('/exposure-check');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Choose the fastest path for the data you have.',
      }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Start the quick estimate/ })).toHaveAttribute(
      'href',
      '/quick-estimate',
    );
    await expect(page.getByRole('link', { name: /Upload a file/ })).toHaveAttribute(
      'href',
      '/liability-preview',
    );
    await expect(page.getByText('About 60 seconds')).toBeVisible();
    await expect(page.getByText('CSV or XLSX')).toBeVisible();
  });

  test('has no serious accessibility violations', async ({ page }) => {
    await page.goto('/exposure-check');
    await expectNoSeriousA11yViolations(page);
  });
});
