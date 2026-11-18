const { generateEnvLoader } = require('./env-loader');

function generatePlaywrightConfig(language) {
    const isTS = language === 'typescript';
    const header = isTS
        ? `import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
`
        : `const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const fs = require('fs');
`;

    const exportStatement = isTS ? 'export default defineConfig({' : 'module.exports = defineConfig({';

    // API specs are matched by file name (*.api.spec.*) rather than by folder: Playwright
    // tests these patterns against the absolute path, so a folder pattern like /api/
    // would also match a parent directory that happens to be called "api".
    return `${header}
${generateEnvLoader()}
// API tests (*.api.spec.*) run once in the "api" project, without a browser.
const API_SPECS = /\\.api\\.spec\\.[jt]s$/;

${exportStatement}
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    actionTimeout: 0,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testMatch: API_SPECS,
    },
    {
      name: 'chromium',
      testIgnore: API_SPECS,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: API_SPECS,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: API_SPECS,
      use: { ...devices['Desktop Safari'] },
    },
  ],

  outputDir: 'test-results/',
});
`;
}

module.exports = { generatePlaywrightConfig };
