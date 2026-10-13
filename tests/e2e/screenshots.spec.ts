import { test } from '@playwright/test';

const WIDTHS = [375, 768, 1440] as const;
const ROUTES = [
  '/',
  '/exposure-check',
  '/quick-estimate',
  '/quick-estimate/result?v=1&value=25k_50k&sectors=iron_steel&origins=china&suppliers=2_5&large=no',
  '/threshold-checker',
  '/liability-preview',
  '/liability-preview/result/fx_supplier_b',
  '/this-page-does-not-exist',
] as const;

test.describe('@visual screenshots', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Runs once; sets its own viewports');
  });

  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      test(`${route} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        // Scroll through the page so below-the-fold entry motion has run before the capture.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(700);
        const name = route === '/' ? 'home' : route.slice(1).split('?')[0]!.replace(/\//g, '-');
        await page.screenshot({
          path: `test-results/screenshots/${name}-${width}.png`,
          fullPage: true,
        });
      });
    }
  }
});
