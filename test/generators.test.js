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

            assert.ok(await fs.pathExists(path.join(dir, '.env.example')), 'missing .env.example');
            assert.ok(await fs.pathExists(path.join(dir, '.env.staging.example')), 'missing .env.staging.example');
            assert.ok(await fs.pathExists(path.join(dir, '.env.prod.example')), 'missing .env.prod.example');

            const pkg = await fs.readJson(path.join(dir, 'package.json'));
            assert.ok(pkg.scripts['test:staging'], 'missing test:staging script');
            assert.ok(pkg.scripts['test:prod'], 'missing test:prod script');
            assert.ok(pkg.scripts['lint'], 'missing lint script');
            assert.ok(pkg.scripts['lint:fix'], 'missing lint:fix script');
            assert.ok(pkg.scripts['format'], 'missing format script');
            assert.ok(pkg.scripts['format:check'], 'missing format:check script');

            assert.ok(pkg.devDependencies['cross-env'], 'missing cross-env dependency');
            assert.ok(pkg.devDependencies['eslint'], 'missing eslint dependency');
            assert.ok(pkg.devDependencies['prettier'], 'missing prettier dependency');
            assert.ok(pkg.devDependencies['eslint-config-prettier'], 'missing eslint-config-prettier dependency');
            assert.ok(pkg.devDependencies['@faker-js/faker'], 'missing @faker-js/faker dependency');

            if (language === 'typescript') {
                assert.ok(pkg.devDependencies['@typescript-eslint/parser'], 'missing @typescript-eslint/parser');
                assert.ok(pkg.devDependencies['@typescript-eslint/eslint-plugin'], 'missing @typescript-eslint/eslint-plugin');
            }

            assert.ok(await fs.pathExists(path.join(dir, '.eslintrc.json')), 'missing .eslintrc.json');
            assert.ok(await fs.pathExists(path.join(dir, '.prettierrc')), 'missing .prettierrc');
            assert.ok(await fs.pathExists(path.join(dir, '.prettierignore')), 'missing .prettierignore');

            assert.ok(await fs.pathExists(path.join(dir, '.mcp.json')), 'missing .mcp.json');
            const mcp = await fs.readJson(path.join(dir, '.mcp.json'));
            assert.ok(mcp.mcpServers && mcp.mcpServers.puppeteer, 'invalid .mcp.json content');

            assert.ok(await fs.pathExists(path.join(dir, 'AI_TESTING.md')), 'missing AI_TESTING.md');
            const aiDocs = await fs.readFile(path.join(dir, 'AI_TESTING.md'), 'utf8');
            assert.ok(aiDocs.includes('AI Agent Guidelines'), 'invalid AI_TESTING.md content');

            const factoryRelPath = framework === 'cypress'
                ? `cypress/fixtures/user-factory.${language === 'typescript' ? 'ts' : 'js'}`
                : `fixtures/user-factory.${language === 'typescript' ? 'ts' : 'js'}`;
            assert.ok(await fs.pathExists(path.join(dir, factoryRelPath)), `missing ${factoryRelPath}`);

            if (framework === 'playwright') {
                const cfg = await fs.readFile(path.join(dir, `playwright.config.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes("screenshot: 'only-on-failure'"), 'playwright missing screenshot on failure');
                assert.ok(cfg.includes("'html'"), 'playwright missing html reporter');
                assert.ok(cfg.includes('TEST_ENV'), 'playwright missing TEST_ENV support');
            } else if (framework === 'cypress') {
                const cfg = await fs.readFile(path.join(dir, `cypress.config.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes('cypress-mochawesome-reporter'), 'cypress missing mochawesome reporter');
                assert.ok(cfg.includes('TEST_ENV'), 'cypress missing TEST_ENV support');
                const support = await fs.readFile(path.join(dir, `cypress/support/e2e.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(support.includes('cypress-mochawesome-reporter/register'), 'cypress support missing mochawesome register');
            } else if (framework === 'webdriverio') {
                const cfg = await fs.readFile(path.join(dir, `wdio.conf.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes('afterTest'), 'wdio missing afterTest hook');
                assert.ok(cfg.includes('saveScreenshot'), 'wdio missing saveScreenshot on failure');
                assert.ok(cfg.includes('TEST_ENV'), 'wdio missing TEST_ENV support');
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

test('generators support custom dependencies and devDependencies', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-deps-'));
    try {
        await createPlaywrightProject(dir, {
            projectName: 'sample-custom-deps',
            testTypes: ['frontend'],
            language: 'typescript',
            includeExamples: false,
            ciProvider: 'none',
            dependencies: 'axios lodash@^4.17.21',
            devDependencies: 'allure-playwright @types/lodash',
        });

        const pkg = await fs.readJson(path.join(dir, 'package.json'));
        assert.equal(pkg.dependencies['axios'], 'latest');
        assert.equal(pkg.dependencies['lodash'], '^4.17.21');
        assert.equal(pkg.devDependencies['allure-playwright'], 'latest');
        assert.equal(pkg.devDependencies['@types/lodash'], 'latest');
    } finally {
        await fs.remove(dir);
    }
});
