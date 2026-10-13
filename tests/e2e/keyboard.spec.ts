import { join } from 'node:path';
import { expect, test } from '@playwright/test';

test.describe('keyboard', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Keyboard run on desktop');
  });

  test('the quick estimate can be completed with the keyboard alone', async ({ page }) => {
    await page.goto('/quick-estimate');
    const choose = async (label: string | RegExp) => {
      await page.getByLabel(label).focus();
      await page.keyboard.press('Space');
    };
    const next = async () => {
      await page.getByRole('button', { name: /Continue|See my estimate/ }).focus();
      await page.keyboard.press('Enter');
    };

    // Radio groups answer to the arrow keys as well as Space.
    await page.getByLabel('Under £25,000').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByLabel('£25,000 to £50,000')).toBeChecked();
    await next();
    await expect(page.getByRole('heading', { level: 2, name: /sectors/ })).toBeFocused();
    await choose('Cement');
    await next();
    await choose('India');
    await next();
    await choose('One supplier');
    await next();
    await choose(/No, imports are fairly steady/);
    await next();
    await expect(page).toHaveURL(/result\?v=1&value=25k_50k&sectors=cement&origins=india/);
    await expect(page.getByText('Demo data')).toBeVisible();
  });

  test('the liability preview can be completed with the keyboard alone', async ({ page }) => {
    await page.goto('/liability-preview');
    await page.getByRole('button', { name: 'Choose a file' }).focus();
    const chooser = page.waitForEvent('filechooser');
    await page.keyboard.press('Enter');
    await (
      await chooser
    ).setFiles(join(process.cwd(), 'tests', 'fixtures', 'northstar-steel-imports.csv'));

    const press = async (name: string | RegExp) => {
      await page.getByRole('button', { name }).focus();
      await page.keyboard.press('Enter');
    };
    await expect(
      page.getByRole('heading', { level: 2, name: 'Check what we found' }),
    ).toBeFocused();
    await press('Continue to mapping');
    await expect(page.getByRole('heading', { level: 2, name: 'Map your columns' })).toBeFocused();
    await press('Continue to validation');
    await expect(page.getByRole('heading', { level: 2, name: 'Validate your rows' })).toBeFocused();
    await press(/Run the preview with 7 rows/);
    await page.getByRole('link', { name: 'View the line-by-line preview' }).focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Indicative CBAM preview' }),
    ).toBeVisible();
  });
});
