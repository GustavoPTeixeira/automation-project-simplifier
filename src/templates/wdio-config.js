function generateWdioConfig(language){
    const isTS = language === 'typescript';

    const header = isTS
            ? `import 'dotenv/config';
            import type { Options } from '@wdio/types';
            `
            : `require('dotenv').config();`;
    
            const exportStatement = isTS ? 'export const config: Options.Testrunner = {'
            : 'exports.config = {';

            return `${header} 
            ${exportStatement}
            runner: 'local',
            specs: [
                '.tests/specs/**/*.${isTS ? 'ts' : 'js'}'
            ],
            exclude: [],
            maxInstances: 5,
            capabilities: [{
                browserName: 'chrome',
                'goog:chromeOptions':{
                    args: process.env.HEADED === 'true' ? [] : ['--headless', '--disable-gpu']                 
                }    
            }]
            logLevel: 'info',
            bail: 0,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
            waitforTimeout: 10000,
            connectionRetryTimeout: 120000,
            connectionRetryCount: 3,
            framework: 'mocha',
            reporters: ['spec'],
            mochaOpts: {
                ui: 'bdd',
                timeout: 60000
            }
        };
        `;
}

module.exports = { generateWdioConfig };