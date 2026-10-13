import { test } from '@playwright/test';

const WIDTHS = [375, 1440] as const;
const ROUTES = [
  '/how-it-works',
  '/sectors',
  '/carbon-price-relief',
  '/rate-watch',
  '/rules-changelog',
  '/worked-example',
  '/guides',
  '/guides/how-the-registration-threshold-works',
] as const;

test.describe('@visual knowledge screenshots', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Runs once; sets its own viewports');
  });

  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      test(`${route} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await page.waitForTimeout(300);
        const name = route.slice(1).replace(/\//g, '-');
        await page.screenshot({
          path: `test-results/screenshots/${name}-${width}.png`,
          fullPage: true,
        });
      });
    }
  }
});
