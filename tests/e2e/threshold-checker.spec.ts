import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './helpers/axe';

test.describe('threshold checker', () => {
  test('shows both views and labels the gauge', async ({ page }) => {
    await page.goto('/threshold-checker');
    await expect(page.getByText('Enter your yearly value to see both tests')).toBeVisible();

    await page.getByLabel('Yearly value of covered goods').fill('45000');
    const backward = page.getByRole('region', { name: 'Backward-looking 12-month view' });
    await expect(backward.getByText('Approaching threshold')).toBeVisible();
    await expect(backward.getByRole('img')).toHaveAttribute(
      'aria-label',
      /£45,000 is 90% of the £50,000 threshold; status Approaching threshold/,
    );
    await expect(backward.getByText('Demo data')).toBeVisible();

    await page.getByLabel(/Expected value in the next 30 days/).fill('60000');
    const forward = page.getByRole('region', { name: 'Forward-looking 30-day view' });
    await expect(forward.getByText('Triggered')).toBeVisible();
    await expect(page.getByText('Product guidance, not a statutory value').first()).toBeVisible();
    await expect(page.getByText('Indicative result')).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test('lumpy imports without an amount are not assessed', async ({ page }) => {
    await page.goto('/threshold-checker');
    await page.getByLabel('Yearly value of covered goods').fill('45000');
    await page.getByLabel(/My imports are lumpy/).check();
    const forward = page.getByRole('region', { name: 'Forward-looking 30-day view' });
    await expect(forward.getByText('Not assessed').first()).toBeVisible();
    await expect(forward.getByText(/Enter your largest expected 30-day amount/)).toBeVisible();
  });
});
