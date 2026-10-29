const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const { createCypressProject } = require('../src/generators/cypress-generator');
const { createPlaywrightProject } = require('../src/generators/playwright-generator');
const { createWdioProject } = require('../src/generators/wdio-generator');
const { generateCiWorkflow } = require('../src/templates/ci-workflow');

const combos = [
    ['cypress', createCypressProject, 'typescript'],
    ['cypress', createCypressProject, 'javascript'],
    ['playwright', createPlaywrightProject, 'typescript'],
    ['playwright', createPlaywrightProject, 'javascript'],
    ['webdriverio', createWdioProject, 'typescript'],
    ['webdriverio', createWdioProject, 'javascript'],
];

for (const [framework, create, language] of combos) {
    test(`${framework} + ${language} generates a sane project`, async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-'));
        try {
            await create(dir, {
                projectName: 'sample',
                testTypes: ['frontend', 'backend'],
                language,
                includeExamples: true,
                ciProvider: 'github',
            });

            const files = (await fs.readdir(dir, { recursive: true }))
                .map((f) => path.join(dir, f));

            for (const file of files) {
                if (!(await fs.stat(file)).isFile()) continue;
                const content = await fs.readFile(file, 'utf8');
                assert.ok(!content.includes('não suportado'), `placeholder content in ${file}`);
                assert.ok(!/from '[^']*\.(ts|js)'/.test(content), `import with extension in ${file}`);
                if (file.endsWith('.json')) JSON.parse(content);
            }

            const gitignore = await fs.readFile(path.join(dir, '.gitignore'), 'utf8');
            assert.ok(!/^\s+\S/m.test(gitignore), '.gitignore has indented lines');

            if (framework === 'playwright') {
                const cfg = await fs.readFile(path.join(dir, `playwright.config.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes("screenshot: 'only-on-failure'"), 'playwright missing screenshot on failure');
                assert.ok(cfg.includes("'html'"), 'playwright missing html reporter');
            } else if (framework === 'cypress') {
                const cfg = await fs.readFile(path.join(dir, `cypress.config.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes('cypress-mochawesome-reporter'), 'cypress missing mochawesome reporter');
                const support = await fs.readFile(path.join(dir, `cypress/support/e2e.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(support.includes('cypress-mochawesome-reporter/register'), 'cypress support missing mochawesome register');
            } else if (framework === 'webdriverio') {
                const cfg = await fs.readFile(path.join(dir, `wdio.conf.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes('afterTest'), 'wdio missing afterTest hook');
                assert.ok(cfg.includes('saveScreenshot'), 'wdio missing saveScreenshot on failure');
            }

            const workflow = await fs.readFile(path.join(dir, '.github', 'workflows', 'e2e.yml'), 'utf8');
            assert.ok(workflow.includes('name: End-to-End Tests'), 'CI workflow missing name');
        } finally {
            await fs.remove(dir);
        }
    });
}

test('CI workflow generator supports all 5 providers', () => {
    const providers = ['github', 'gitlab', 'azure', 'bitbucket', 'jenkins'];
    const frameworks = ['playwright', 'cypress', 'webdriverio'];

    for (const provider of providers) {
        for (const framework of frameworks) {
            const { filePath, content } = generateCiWorkflow(provider, framework);
            assert.ok(filePath, `Missing filePath for ${provider} + ${framework}`);
            assert.ok(content && content.length > 20, `Missing content for ${provider} + ${framework}`);
        }
    }
});
