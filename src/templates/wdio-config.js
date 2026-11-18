const { generateEnvLoader } = require('./env-loader');

// The JavaScript variant is an ES module: generated WebdriverIO JS projects are
// "type": "module", because WebdriverIO loads spec files with native import().
function generateWdioConfig(language){
    const isTS = language === 'typescript';

    const header = isTS
        ? `import dotenv from 'dotenv';
import fs from 'fs';
import type { Options } from '@wdio/types';
`
        : `import dotenv from 'dotenv';
import fs from 'fs';
`;

    const exportStatement = isTS
        ? 'export const config: Options.Testrunner = {'
        : 'export const config = {';

    return `${header}
${generateEnvLoader()}
${exportStatement}
  runner: 'local',
  specs: [
    './tests/specs/**/*.${isTS ? 'ts' : 'js'}'
  ],
  exclude: [],
  maxInstances: 5,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.env.HEADED === 'true' ? [] : ['--headless', '--disable-gpu']
    }
  }],
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
  },
  afterTest: async function (test, context, { passed }) {
    if (!passed) {
      const dir = './screenshots';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filename = \`\${test.title.replace(/[^a-zA-Z0-9]/g, '_')}.png\`;
      await browser.saveScreenshot(\`\${dir}/\${filename}\`);
    }
  }
};
`;
}

module.exports = { generateWdioConfig };
