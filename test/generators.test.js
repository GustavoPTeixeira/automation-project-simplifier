const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const vm = require('vm');
const fs = require('fs-extra');
const prettier = require('prettier');

const { createCypressProject } = require('../src/generators/cypress-generator');
const { createPlaywrightProject } = require('../src/generators/playwright-generator');
const { createWdioProject } = require('../src/generators/wdio-generator');
const { generateCiWorkflow } = require('../src/templates/ci-workflow');
const { generateEnvLoader } = require('../src/templates/env-loader');

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

            // WebdriverIO JS projects are native ES modules, so relative imports need the .js
            // extension. Everywhere else a transpiler/bundler resolves extensionless imports.
            const needsJsExtension = framework === 'webdriverio' && language === 'javascript';
            const ignorePath = path.join(dir, '.prettierignore');

            for (const file of files) {
                if (!(await fs.stat(file)).isFile()) continue;
                const content = await fs.readFile(file, 'utf8');
                assert.ok(!content.includes('não suportado'), `placeholder content in ${file}`);
                for (const [, specifier] of content.matchAll(/from '(\.[^']*)'/g)) {
                    if (needsJsExtension) {
                        assert.ok(specifier.endsWith('.js'), `ES module import without .js extension in ${file}: ${specifier}`);
                    } else {
                        assert.ok(!/\.(ts|js)$/.test(specifier), `import with extension in ${file}: ${specifier}`);
                    }
                }
                if (file.endsWith('.json')) JSON.parse(content);

                // Same check as the generated `npm run format:check`.
                const { ignored, inferredParser } = await prettier.getFileInfo(file, { ignorePath });
                if (!ignored && inferredParser) {
                    const options = await prettier.resolveConfig(file);
                    assert.ok(await prettier.check(content, { ...options, filepath: file }), `not Prettier-formatted: ${file}`);
                }
            }

            const gitignore = await fs.readFile(path.join(dir, '.gitignore'), 'utf8');
            assert.ok(!/^\s+\S/m.test(gitignore), '.gitignore has indented lines');

            assert.ok(await fs.pathExists(path.join(dir, '.env.example')), 'missing .env.example');
            assert.ok(await fs.pathExists(path.join(dir, '.env.staging.example')), 'missing .env.staging.example');
            assert.ok(await fs.pathExists(path.join(dir, '.env.prod.example')), 'missing .env.prod.example');

            const pkg = await fs.readJson(path.join(dir, 'package.json'));
            assert.equal(pkg.private, true, 'generated project must be private (no accidental npm publish)');
            assert.equal(pkg.author, '', 'generated project must not carry the CLI author');
            assert.equal(pkg.license, 'UNLICENSED');
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

            assert.ok(await fs.pathExists(path.join(dir, 'README.md')), 'missing project README.md');
            const projectReadme = await fs.readFile(path.join(dir, 'README.md'), 'utf8');
            assert.ok(projectReadme.includes('sample'), 'project README.md missing project name');

            const factoryRelPath = framework === 'cypress'
                ? `cypress/fixtures/user-factory.${language === 'typescript' ? 'ts' : 'js'}`
                : `fixtures/user-factory.${language === 'typescript' ? 'ts' : 'js'}`;
            assert.ok(await fs.pathExists(path.join(dir, factoryRelPath)), `missing ${factoryRelPath}`);

            if (framework === 'playwright') {
                const cfg = await fs.readFile(path.join(dir, `playwright.config.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes("screenshot: 'only-on-failure'"), 'playwright missing screenshot on failure');
                assert.ok(cfg.includes("'html'"), 'playwright missing html reporter');
                assert.ok(cfg.includes('TEST_ENV'), 'playwright missing TEST_ENV support');
                assert.ok(cfg.includes('was not found'), 'playwright config must fail on a missing TEST_ENV file');
                assert.ok(cfg.includes("name: 'api'"), 'playwright missing browserless api project');
                assert.equal(pkg.scripts['test:api'], 'playwright test --project=api');

                const apiSpec = path.join(dir, `tests/api/users.api.spec.${language === 'typescript' ? 'ts' : 'js'}`);
                assert.ok(await fs.pathExists(apiSpec), 'API spec must use the *.api.spec.* suffix to reach the api project');
                assert.ok(!/beforeAll\(\s*async\s*\(\s*\{[^}]*\brequest\b/.test(await fs.readFile(apiSpec, 'utf8')),
                    'the request fixture is test-scoped and cannot be shared from beforeAll');
            } else if (framework === 'cypress') {
                const cfg = await fs.readFile(path.join(dir, `cypress.config.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes('cypress-mochawesome-reporter'), 'cypress missing mochawesome reporter');
                assert.ok(cfg.includes('TEST_ENV'), 'cypress missing TEST_ENV support');
                assert.ok(cfg.includes('was not found'), 'cypress config must fail on a missing TEST_ENV file');
                const support = await fs.readFile(path.join(dir, `cypress/support/e2e.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(support.includes('cypress-mochawesome-reporter/register'), 'cypress support missing mochawesome register');
            } else if (framework === 'webdriverio') {
                const cfg = await fs.readFile(path.join(dir, `wdio.conf.${language === 'typescript' ? 'ts' : 'js'}`), 'utf8');
                assert.ok(cfg.includes('afterTest'), 'wdio missing afterTest hook');
                assert.ok(cfg.includes('saveScreenshot'), 'wdio missing saveScreenshot on failure');
                assert.ok(cfg.includes('TEST_ENV'), 'wdio missing TEST_ENV support');
                assert.ok(cfg.includes('was not found'), 'wdio config must fail on a missing TEST_ENV file');
                assert.ok(pkg.scripts['test:headed'].startsWith('cross-env '), 'test:headed must set HEADED via cross-env (Windows)');
                if (language === 'javascript') {
                    assert.equal(pkg.type, 'module', 'WebdriverIO loads JS specs with import(): package must be an ES module');
                    assert.ok(cfg.includes('export const config'), 'wdio.conf.js must be an ES module');
                    assert.ok(!cfg.includes('require('), 'wdio.conf.js must not use require() in an ES module package');
                }
            }

            const workflow = await fs.readFile(path.join(dir, '.github', 'workflows', 'e2e.yml'), 'utf8');
            assert.ok(workflow.includes('name: End-to-End Tests'), 'CI workflow missing name');
        } finally {
            await fs.remove(dir);
        }
    });
}

for (const [framework, create, language] of combos) {
    test(`${framework} + ${language} without examples still generates the base classes`, async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-noex-'));
        try {
            await create(dir, {
                projectName: 'sample',
                testTypes: ['frontend', 'backend'],
                language,
                includeExamples: false,
                ciProvider: 'none',
            });

            const ext = language === 'typescript' ? 'ts' : 'js';
            const root = framework === 'cypress' ? 'cypress/' : '';
            assert.ok(await fs.pathExists(path.join(dir, `${root}pages/BasePage.${ext}`)), 'missing BasePage');
            assert.ok(await fs.pathExists(path.join(dir, `${root}services/BaseService.${ext}`)), 'missing BaseService');
            assert.ok(!(await fs.pathExists(path.join(dir, `${root}pages/LoginPage.${ext}`))), 'example page generated with --no-examples');
            assert.ok(!(await fs.pathExists(path.join(dir, `${root}services/UserService.${ext}`))), 'example service generated with --no-examples');
        } finally {
            await fs.remove(dir);
        }
    });
}

test('env loader fails on a missing TEST_ENV file instead of falling back to .env', () => {
    const run = (env, existingFiles) => {
        const loaded = [];
        vm.runInNewContext(generateEnvLoader(), {
            process: { env },
            fs: { existsSync: (file) => existingFiles.includes(file) },
            dotenv: { config: ({ path: file }) => loaded.push(file) },
        });
        return loaded;
    };

    assert.deepEqual(run({}, []), ['.env']);
    assert.deepEqual(run({ TEST_ENV: 'local' }, ['.env']), ['.env']);
    assert.deepEqual(run({ TEST_ENV: 'staging' }, ['.env', '.env.staging']), ['.env.staging']);
    assert.throws(() => run({ TEST_ENV: 'staging' }, ['.env']), /\.env\.staging was not found/);
});

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
