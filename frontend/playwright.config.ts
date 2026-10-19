import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  use: {
    baseURL: process.env.MEMORAX_E2E_URL || (process.env.MEMORAX_E2E_STATIC ? 'http://memorax.test' : 'http://127.0.0.1:8765'),
    launchOptions: process.env.MEMORAX_BROWSER_PATH ? { executablePath: process.env.MEMORAX_BROWSER_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
});
