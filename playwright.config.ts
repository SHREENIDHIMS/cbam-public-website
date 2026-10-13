import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  grepInvert: process.env.CI ? /@visual/ : undefined,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // Chromium with a Pixel 7 viewport; WebKit is not installed.
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: BASE_URL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      PUBLIC_API_MODE: 'fixture',
      RATE_LIMIT_DISABLED: 'true',
      NEXT_PUBLIC_SITE_ENV: 'development',
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      NEXT_PUBLIC_CBAM_APP_URL: 'https://app.example.test',
      NEXT_PUBLIC_CBAM_CREATE_WORKSPACE_PATH: '/workspaces/new',
    },
  },
});
