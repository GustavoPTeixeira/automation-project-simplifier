function generateCypressConfig(language, testTypes){
    const isTS = language === 'typescript';
    const e2eSetup = `
    e2e: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        setupNodeEvents(on, config) {
            // implement node event listeners here
            // Load environment variables from .env file
            require('dotenv').config({ path: '.env'});
            config.env = {
                ...process.env,
                ...config.env
            };
            return config;
        },
    }`;

    if (isTS) {
        return `
    import { defineConfig } from 'cypress';
    import * as dotenv from 'dotenv';

    dotenv.config({ path: '.env' });

    export default defineConfig({
        env: {
            API_URL: process.env.CYPRESS_API_URL || 'http://localhost:3000/api',
    },
    ${e2eSetup}
    });
    `;
    }
    return `
    const { defineConfig } = require('cypress');
    require('dotenv').config({ path: '.env' });

    module.exports = defineConfig({
        env: {
            API_URL: process.env.CYPRESS_API_URL || 'http://localhost:3000/api',
        },
        ${e2eSetup}
        });
        `;
}

module.exports = { generateCypressConfig };