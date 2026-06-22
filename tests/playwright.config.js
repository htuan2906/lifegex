/* Task 50: Visual Regression Testing Playwright Config */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './visual',
  timeout: 30000,
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10000,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 812 } },
    },
    {
      name: 'dark',
      use: {
        viewport: { width: 1440, height: 900 },
        colorScheme: 'dark',
      },
    },
  ],
});
