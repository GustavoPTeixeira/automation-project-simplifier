function generatePlaywrightConfig(language) {
    const isTS = language === 'typescript';

    const header = isTS
        ? `import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
`
        : `require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');
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
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    actionTimeout: 0,
    trace: 'on-first-retry',
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