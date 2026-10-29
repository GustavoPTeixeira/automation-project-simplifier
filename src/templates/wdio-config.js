function generateWdioConfig(language){
    const isTS = language === 'typescript';

    const header = isTS
        ? `import 'dotenv/config';\nimport type { Options } from '@wdio/types';\n`
        : `require('dotenv').config();\n`;

    const exportStatement = isTS
        ? 'export const config: Options.Testrunner = {'
        : 'exports.config = {';

    return `${header}
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
  afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    if (!passed) {
      const fs = require('fs');
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
