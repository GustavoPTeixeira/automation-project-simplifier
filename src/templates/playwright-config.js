function generatePlaywrightConfig(language) {
    const isTS = language === 'typescript';
    const header = isTS
        ? `import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
const testEnv = process.env.TEST_ENV || 'local';
const envFile = fs.existsSync(\`.env.\${testEnv}\`) ? \`.env.\${testEnv}\` : '.env';
dotenv.config({ path: envFile });
`
        : `const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const fs = require('fs');
const testEnv = process.env.TEST_ENV || 'local';
const envFile = fs.existsSync(\`.env.\${testEnv}\`) ? \`.env.\${testEnv}\` : '.env';
dotenv.config({ path: envFile });
`;

    const exportStatement = isTS ? 'export default defineConfig({' : 'module.exports = defineConfig({';

    return `${header}
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
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  outputDir: 'test-results/',
});
`;
}

module.exports = { generatePlaywrightConfig };