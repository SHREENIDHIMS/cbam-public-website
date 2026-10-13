import { expect, test } from '@playwright/test';
import {
  fixture,
  reachResult,
  runPreview,
  toMapping,
  toValidation,
  uploadFile,
} from './helpers/liability';
import { readFileSync } from 'node:fs';

test.describe('Demo data indicator', () => {
  test('is shown on the quick estimate result and the threshold checker', async ({ page }) => {
    await page.goto(
      '/quick-estimate/result?v=1&value=25k_50k&sectors=iron_steel&origins=china&suppliers=2_5&large=no',
    );
    await expect(page.getByText('Demo data')).toBeVisible();
    await page.goto('/threshold-checker');
    await page.getByLabel('Yearly value of covered goods').fill('45000');
    await expect(
      page.getByRole('region', { name: 'Backward-looking 12-month view' }).getByText('Demo data'),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Forward-looking 30-day view' }).getByText('Demo data'),
    ).toBeVisible();
  });

  test('is shown on the scope step and the result page', async ({ page }) => {
    await uploadFile(page, 'meridian-aluminium.xlsx');
    await toMapping(page);
    await toValidation(page);
    await runPreview(page);
    await expect(page.getByText('Demo data')).toBeVisible();
    await page.getByRole('link', { name: 'View the line-by-line preview' }).click();
    await expect(page.getByText('Demo data').first()).toBeVisible();
  });

  test('a file that is not a sample gets the labelled demo result', async ({ page }) => {
    const text = readFileSync(fixture('northstar-steel-imports.csv'), 'utf8').replace(
      '31800',
      '31801',
    );
    await page.goto('/liability-preview');
    await page.locator('input[type=file]').setInputFiles({
      name: 'mine.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(text),
    });
    await toMapping(page);
    await toValidation(page);
    await runPreview(page);
    await expect(
      page.getByText('Demo result: not calculated from your file', { exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'View the line-by-line preview' }).click();
    await expect(
      page.getByText('Demo result: not calculated from your file', { exact: true }),
    ).toBeVisible();
  });

  test('is shown on a sample result reached directly', async ({ page }) => {
    await page.goto('/liability-preview/result/fx_supplier_b');
    await expect(page.getByText('Demo data').first()).toBeVisible();
    await expect(page.getByText('Indicative result')).toBeVisible();
    void reachResult;
  });
});
