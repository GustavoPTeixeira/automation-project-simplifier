const fs = require('fs-extra');
const path = require('path');
const { generatePackageJson } = require('../templates/package-json');
const { generateWdioConfig } = require('../templates/wdio-config');
const { generateBasePage } = require('../templates/base-page');
const { generatePageObject } = require('../templates/page-object');
const { generateBaseService } = require('../templates/base-service');
const { generateServiceObject } = require('../templates/service-object');
const { generateFrontendTest } = require('../templates/frontend-test');
const { generateBackendTest } = require('../templates/backend-test');
const { generateCiWorkflow } = require('../templates/ci-workflow');
const { generateEnvContent } = require('../templates/env-config');

async function createWdioProject(projectPath, options){
    const { projectName, testTypes, language, includeExamples, ciProvider } = options;
    const isTS = language === 'typescript';

    const directories = [
        'tests/specs',
        'fixtures'
    ];

    if(testTypes.includes('frontend')){
        directories.push('pages');
    }

    if (testTypes.includes('backend')) {
        directories.push('services');
    }

    for (const dir of directories) {
        await fs.ensureDir(path.join(projectPath, dir));
    }

    const packageJson = generatePackageJson({
        projectName,
        framework: 'webdriverio',
        language,
        testTypes
    });
    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

    const configFile = `wdio.conf.${isTS ? 'ts' : 'js'}`;
    const wdioConfig = generateWdioConfig(language);
    await fs.writeFile(path.join(projectPath, configFile), wdioConfig);

    if (isTS) {
        const tsConfig = {
            compilerOptions: {
                moduleResolution: "node",
                module: "commonjs",
                target: "ES2022",
                lib: ["ES2022", "DOM"],
                types: [
                    "node",
                    "@wdio/globals/types",
                    "@wdio/mocha-framework"
                ],
                skipLibCheck: true,
                strict: true,
                esModuleInterop: true
            },
            include: [
                "tests/**/*.ts",
                "pages/**/*.ts",
                "services/**/*.ts",
                "fixtures/**/*.ts",
                "wdio.conf.ts"
            ]
        };
        await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
    }

    if (includeExamples) {
        if (testTypes.includes('frontend')) {
            const basePageFile = `pages/BasePage.${isTS ? 'ts' : 'js'}`;
            const basePageContent = generateBasePage(language, 'webdriverio');
            await fs.writeFile(path.join(projectPath, basePageFile), basePageContent);

            const pageObjectFile = `pages/LoginPage.${isTS ? 'ts' : 'js'}`;
            const pageObjectContent = generatePageObject(language, 'webdriverio');
            await fs.writeFile(path.join(projectPath, pageObjectFile), pageObjectContent);

            const frontendTestFile = `tests/specs/login.e2e.${isTS ? 'ts' : 'js'}`;
            const frontendTestContent = generateFrontendTest(language, 'webdriverio');
            await fs.writeFile(path.join(projectPath, frontendTestFile), frontendTestContent);
        }

        if (testTypes.includes('backend')) {
            const baseServiceFile = `services/BaseService.${isTS ? 'ts' : 'js'}`;
            const baseServiceContent = generateBaseService(language, 'webdriverio');
            await fs.writeFile(path.join(projectPath, baseServiceFile), baseServiceContent);

            const serviceObjectFile = `services/UserService.${isTS ? 'ts' : 'js'}`;
            const serviceObjectContent = generateServiceObject(language, 'webdriverio');
            await fs.writeFile(path.join(projectPath, serviceObjectFile), serviceObjectContent);

            const apiTestDir = 'tests/specs/api';
            await fs.ensureDir(path.join(projectPath, apiTestDir));
            const backendTestFile = `${apiTestDir}/users.api.${isTS ? 'ts' : 'js'}`;
            const backendTestContent = generateBackendTest(language, 'webdriverio');
            await fs.writeFile(path.join(projectPath, backendTestFile), backendTestContent);
        }
    }

    const fixtureFile = `fixtures/users.${isTS ? 'ts' : 'json'}`;
    if (isTS) {
        const fixtureContent = `export const users = [
  { username: 'testuser', password: 'password123', email: 'test@example.com' },
  { username: 'admin', password: 'admin123', email: 'admin@example.com' },
];

export const testUser = users[0];
`;
        await fs.writeFile(path.join(projectPath, fixtureFile), fixtureContent);
    } else {
        const fixtureExample = {
            users: [
                { username: 'testuser', password: 'password123', email: 'test@example.com' },
                { username: 'admin', password: 'admin123', email: 'admin@example.com' }
            ]
        };
        await fs.writeJson(path.join(projectPath, fixtureFile), fixtureExample, { spaces: 2 });
    }

    const gitignore = `node_modules/
screenshots/
.env
.env.*
!.env.example
!.env.*.example
*.log
dist/
.DS_Store
`;
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

    await fs.writeFile(path.join(projectPath, '.env.example'), generateEnvContent('webdriverio', 'local'));
    await fs.writeFile(path.join(projectPath, '.env.staging.example'), generateEnvContent('webdriverio', 'staging'));
    await fs.writeFile(path.join(projectPath, '.env.prod.example'), generateEnvContent('webdriverio', 'prod'));

    if (ciProvider && ciProvider !== 'none') {
        const { filePath, content } = generateCiWorkflow(ciProvider, 'webdriverio');
        if (filePath && content) {
            await fs.ensureDir(path.join(projectPath, path.dirname(filePath)));
            await fs.writeFile(path.join(projectPath, filePath), content);
        }
    }
}

module.exports = { createWdioProject };
