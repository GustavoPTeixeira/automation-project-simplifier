function generateCypressConfig(language){
    const isTS = language === 'typescript';

     const body = `defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Cypress Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  screenshotOnRunFailure: true,
  video: false,
  env: {
    API_URL: process.env.CYPRESS_API_URL || 'http://localhost:3000/api',
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});
`;
    if (isTS) {
        return `import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
export default ${body}`;
    }
    return `const { defineConfig } = require('cypress');
require('dotenv').config({ path: '.env' });
module.exports = ${body}`;
}

module.exports = { generateCypressConfig };