import { join } from 'node:path';
import { expect, type Page } from '@playwright/test';

export const fixture = (name: string) => join(process.cwd(), 'tests', 'fixtures', name);

export async function uploadFile(
  page: Page,
  file: string | { name: string; mimeType: string; buffer: Buffer },
) {
  await page.goto('/liability-preview');
  await page
    .locator('input[type=file]')
    .setInputFiles(typeof file === 'string' ? fixture(file) : file);
}

export async function toMapping(page: Page) {
  await expect(page.getByRole('heading', { level: 2, name: 'Check what we found' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to mapping' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Map your columns' })).toBeVisible();
}

export async function toValidation(page: Page) {
  await page.getByRole('button', { name: 'Continue to validation' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Validate your rows' })).toBeVisible();
}

export async function runPreview(page: Page) {
  await page.getByRole('button', { name: /Run the preview with/ }).click();
  await expect(page.getByRole('link', { name: 'View the line-by-line preview' })).toBeVisible();
}

/** Upload, accept the suggested mapping, run, and open the result. */
export async function reachResult(page: Page, file: string) {
  await uploadFile(page, file);
  await toMapping(page);
  await toValidation(page);
  await runPreview(page);
  await page.getByRole('link', { name: 'View the line-by-line preview' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Indicative CBAM preview' }),
  ).toBeVisible();
}
