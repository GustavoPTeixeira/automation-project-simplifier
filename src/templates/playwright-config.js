function generatePlaywrightConfig(language, testTypes) {
    const isTS = language === 'typescript';
    const importType = isTS ? `import type { PlaywrightTestConfig } from '@playwright/test';` : `/** @type {import('@playwright/test').PlaywrightTestConfig} */`;
    const importDotenv = isTS ? `import 'dotenv/config';` : `require('dotenv').config();`;
    const exportType = isTS ? `export default config;` : `module.exports = config;`;

    return `
    ${importType}
    const { devices } = require('@playwright/test');
    ${importDotenv}

    const config = {
        testDir: './tests',
        timeout: 30000,
        expect: {
            timeout: 5000
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
            extraHTTPHeaders: {
                'Accept': 'application/json',
            },
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
    };

    ${exportType}
    `
}

module.exports = { generatePlaywrightConfig };