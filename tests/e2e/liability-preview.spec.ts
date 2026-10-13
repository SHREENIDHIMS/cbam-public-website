import { expect, test } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './helpers/axe';
import {
  fixture,
  reachResult,
  runPreview,
  toMapping,
  toValidation,
  uploadFile,
} from './helpers/liability';

test.describe('liability preview flow', () => {
  test('Northstar CSV goes from upload to result, with every step accessible', async ({ page }) => {
    await page.goto('/liability-preview');
    await expectNoSeriousA11yViolations(page);
    await uploadFile(page, 'northstar-steel-imports.csv');

    await expect(
      page.getByRole('heading', { level: 2, name: 'Check what we found' }),
    ).toBeFocused();
    await expect(page.getByText('9 columns')).toBeVisible();
    await expectNoSeriousA11yViolations(page);
    await page.getByRole('button', { name: 'Continue to mapping' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Map your columns' })).toBeFocused();
    await expect(page.getByText('High match')).toHaveCount(9);
    await expectNoSeriousA11yViolations(page);
    await toValidation(page);

    await expect(page.getByText('All 7 rows are ready.')).toBeVisible();
    await expectNoSeriousA11yViolations(page);
    await runPreview(page);
    const scope = page.getByRole('heading', { level: 2, name: 'Resolve scope' });
    await expect(scope).toBeVisible();
    await expect(page.locator('dd', { hasText: /^5$/ })).toBeVisible();
    await expectNoSeriousA11yViolations(page);

    await page.getByRole('link', { name: 'View the line-by-line preview' }).click();
    await expect(page).toHaveURL(/\/liability-preview\/result\/fx_northstar$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Indicative CBAM preview' }),
    ).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test('Meridian XLSX shows medium-confidence matches', async ({ page }) => {
    await uploadFile(page, 'meridian-aluminium.xlsx');
    await toMapping(page);
    await expect(page.getByText('Possible match').first()).toBeVisible();
    expect(await page.getByText(/Possible match/).count()).toBe(2);
    await toValidation(page);
    await expect(page.getByText('All 4 rows are ready.')).toBeVisible();
    await runPreview(page);
  });

  test('an unmapped required column blocks the step until it is fixed', async ({ page }) => {
    await uploadFile(page, 'northstar-steel-imports.csv');
    await toMapping(page);
    const select = page.getByLabel('Read column "Commodity code" as');
    await select.selectOption({ label: "Don't use this column" });
    await page.getByRole('button', { name: 'Continue to validation' }).click();
    await expect(page.getByText('Choose a column for Commodity code')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Map your columns' })).toBeVisible();
    await select.selectOption({ label: 'Commodity code' });
    await toValidation(page);
  });

  test('Supplier B switches sheet and shows a possible match for the misspelt heading', async ({
    page,
  }) => {
    await uploadFile(page, 'supplier-b-messy.xlsx');
    await expect(
      page.getByText('We used sheet "Lines" because "Cover" has no column headings.'),
    ).toBeVisible();
    await expect(page.getByText(/We skipped 2 rows above the headings/)).toBeVisible();
    await page.getByRole('button', { name: 'Continue to mapping' }).click();
    await expect(page.getByText(/Close spelling of 'commodity code'/)).toBeVisible();
    await toValidation(page);
    await expect(page.getByText('We found 1 row that needs review.')).toBeVisible();
    await expect(page.getByText(/Decimal commas found in Net mass/)).toBeVisible();
  });

  test('the broker export lists the exact row issues', async ({ page }) => {
    await uploadFile(page, 'broker-export-messy.csv');
    await toMapping(page);
    await expect(page.getByText('Possible match')).toHaveCount(1);
    await toValidation(page);
    await expect(page.getByText('We found 4 rows that need review.')).toBeVisible();
    const rows = page.locator('tbody tr');
    await expect(rows.filter({ hasText: '2027-13-02' })).toContainText('3');
    await expect(rows.filter({ hasText: 'Repeat of row 4' })).toContainText('Duplicate');
    await expect(rows.filter({ hasText: 'Commodity code is missing' })).toContainText('Rejected');
    await expect(rows.filter({ hasText: 'EUR' })).toContainText('Needs review');
    await page.getByLabel('Rejected', { exact: true }).check({ force: true });
    await expect(page.locator('tbody tr')).toHaveCount(2);
  });

  test('a macro-enabled file and an oversized row count are rejected', async ({ page }) => {
    await uploadFile(page, 'invalid/report.xlsm');
    await expect(page.locator('#upload-error')).toContainText('Macro-enabled workbooks');

    const header = 'Entry date,Commodity code,Net mass,Customs value\n';
    const lines = Array.from({ length: 5001 }, () => '2027-01-12,7208390000,1000,500').join('\n');
    await page.locator('input[type=file]').setInputFiles({
      name: 'big.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(header + lines),
    });
    await expect(page.locator('#upload-error')).toContainText('This file has 5,001 data rows');

    await page.locator('input[type=file]').setInputFiles(fixture('edge/headers-only.csv'));
    await expect(page.locator('#upload-error')).toContainText('no data rows');
  });
});

test.describe('liability preview result', () => {
  test('Northstar result: grouped table, summary and workings', async ({ page }) => {
    await reachResult(page, 'northstar-steel-imports.csv');
    await expect(page.getByText('£9,073.48').first()).toBeVisible();
    const table = page.getByRole('region', { name: /Line-level preview, 7 lines/ });
    await expect(
      table.locator('tbody[data-scope=in_scope] tbody, tbody[data-scope=in_scope]'),
    ).toHaveCount(1);
    await expect(
      page.locator('tbody[data-scope=out_of_scope]').getByText('7204410000'),
    ).toBeVisible();
    await expect(page.locator('tbody[data-scope=before_start]')).toContainText('7208390000');
    await expect(page.locator('tbody[data-scope=in_scope] tr')).toHaveCount(6);

    await page.getByRole('link', { name: '7318158100' }).click();
    await expect(page.locator('#line-L4')).toHaveAttribute('open', '');
    await expect(page.locator('#line-L4')).toContainText('12.60 tCO2e');
  });

  test('Scenario badges and the methodology drawer', async ({ page }) => {
    await reachResult(page, 'northstar-steel-imports.csv');
    expect(await page.getByText('Scenario', { exact: true }).count()).toBeGreaterThan(3);
    await page.getByRole('button', { name: 'How these numbers are worked out' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Scenario carbon rate', { exact: true }).first()).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Missing information' })).toBeVisible();
    await expectNoSeriousA11yViolations(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'How these numbers are worked out' }),
    ).toBeFocused();
  });

  test('the workspace link carries no session id', async ({ page }) => {
    await reachResult(page, 'northstar-steel-imports.csv');
    const link = page.getByRole('link', { name: /Create a workspace/ });
    await expect(link).toHaveAttribute('href', 'https://app.example.test/workspaces/new');
  });

  test('the table scrolls sideways on a phone and keeps its heading row visible', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium', 'Phone viewport only');
    await page.goto('/liability-preview/result/fx_northstar');
    const region = page.getByTestId('liability-table-region');
    const metrics = await region.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
    expect(metrics.sw).toBeGreaterThan(metrics.cw);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await region.evaluate((el) => el.scrollBy(0, 40));
    const head = page.getByRole('columnheader', { name: 'Description' });
    const [regionBox, headBox] = await Promise.all([region.boundingBox(), head.boundingBox()]);
    expect(Math.abs(headBox!.y - regionBox!.y)).toBeLessThan(40);
  });

  test('an unknown session id shows the no-data state', async ({ page }) => {
    await page.goto('/liability-preview/result/fx_unknown');
    await expect(page.getByText('We could not find that preview')).toBeVisible();
  });
});
