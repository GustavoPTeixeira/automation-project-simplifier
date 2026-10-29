const fs = require('fs-extra');
const path = require('path');
const { generatePackageJson } = require('../templates/package-json');
const { generatePlaywrightConfig } = require('../templates/playwright-config');
const { generateBasePage } = require('../templates/base-page');
const { generatePageObject } = require('../templates/page-object');
const { generateBaseService } = require('../templates/base-service');
const { generateServiceObject } = require('../templates/service-object');
const { generateFrontendTest } = require('../templates/frontend-test');
const { generateBackendTest } = require('../templates/backend-test');
const { generateCiWorkflow } = require('../templates/ci-workflow');
const { generateEnvContent } = require('../templates/env-config');
const { generateEslintConfig, generatePrettierConfig, generatePrettierIgnore } = require('../templates/lint-config');
const { generateDataFactory } = require('../templates/data-factory');

async function createPlaywrightProject(projectPath, options){
    const { projectName, testTypes, language, includeExamples, ciProvider } = options;
    const isTS = language === 'typescript';

    const directories = [
        'tests',
        'fixtures'
    ];

    if(testTypes.includes('frontend')){
        directories.push('pages');
    }

    if(testTypes.includes('backend')){
        directories.push('services');
    }

    for(const dir of directories){
        await fs.ensureDir(path.join(projectPath, dir));
    }

    const packageJson = generatePackageJson({
        projectName,
        framework: 'playwright',
        language,
        testTypes
    });
    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

    const configFile = `playwright.config.${isTS ? 'ts' : 'js'}`;
    const playwrightConfig = generatePlaywrightConfig(language);
    await fs.writeFile(path.join(projectPath, configFile), playwrightConfig);

    if(isTS){
        const tsConfig = {
            compilerOptions: {
              target: "ES2020",
              lib: ["ES2020"],
              types: ["node", "@playwright/test"],
              module: "commonjs",
              moduleResolution: "node",
              esModuleInterop: true,
              resolveJsonModule: true,
              strict: true,
              skipLibCheck: true,
              baseUrl: ".",
              paths: {
                "@pages/*": ["pages/*"],
                "@services/*": ["services/*"],
                "@fixtures/*": ["fixtures/*"]
              }
            },
            include: ["**/*.ts"]
          };
          await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });  
    }
    
    if(includeExamples){
        if(testTypes.includes('frontend')){
            const basePageFile = `pages/BasePage.${isTS ? 'ts' : 'js'}`;
            const basePageContent = generateBasePage(language, 'playwright');
            await fs.writeFile(path.join(projectPath, basePageFile), basePageContent);

            const pageObjectFile = `pages/LoginPage.${isTS ? 'ts' : 'js'}`;
            const pageObjectContent = generatePageObject(language, 'playwright');
            await fs.writeFile(path.join(projectPath, pageObjectFile), pageObjectContent);

            const frontendTestFile = `tests/login.spec.${isTS ? 'ts' : 'js'}`;
            const frontendTestContent = generateFrontendTest(language, 'playwright');
            await fs.writeFile(path.join(projectPath, frontendTestFile), frontendTestContent);
        }

        if(testTypes.includes('backend')){
            const baseServiceFile = `services/BaseService.${isTS ? 'ts' : 'js'}`;
            const baseServiceContent = generateBaseService(language, 'playwright');
            await fs.writeFile(path.join(projectPath, baseServiceFile), baseServiceContent);

            const serviceObjectFile = `services/UserService.${isTS ? 'ts' : 'js'}`;
            const serviceObjectContent = generateServiceObject(language, 'playwright');
            await fs.writeFile(path.join(projectPath, serviceObjectFile), serviceObjectContent);
      
            const apiTestDir = 'tests/api';
            await fs.ensureDir(path.join(projectPath, apiTestDir));
            const backendTestFile = `${apiTestDir}/users.spec.${isTS ? 'ts' : 'js'}`;
            const backendTestContent = generateBackendTest(language, 'playwright');
            await fs.writeFile(path.join(projectPath, backendTestFile), backendTestContent);
        }
    }

    const fixtureFile = `fixtures/users.${isTS ? 'ts' : 'json'}`;
    if(isTS){
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

    const factoryFile = `fixtures/user-factory.${isTS ? 'ts' : 'js'}`;
    await fs.writeFile(path.join(projectPath, factoryFile), generateDataFactory(language));
    const gitignore = `node_modules/
test-results/
playwright-report/
playwright/.cache/
.env
.env.*
!.env.example
!.env.*.example
*.log
dist/
.DS_Store
`;
  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

  await fs.writeFile(path.join(projectPath, '.env.example'), generateEnvContent('playwright', 'local'));
  await fs.writeFile(path.join(projectPath, '.env.staging.example'), generateEnvContent('playwright', 'staging'));
  await fs.writeFile(path.join(projectPath, '.env.prod.example'), generateEnvContent('playwright', 'prod'));

  await fs.writeJson(path.join(projectPath, '.eslintrc.json'), generateEslintConfig('playwright', language), { spaces: 2 });
  await fs.writeJson(path.join(projectPath, '.prettierrc'), generatePrettierConfig(), { spaces: 2 });
  await fs.writeFile(path.join(projectPath, '.prettierignore'), generatePrettierIgnore('playwright'));

  if (ciProvider && ciProvider !== 'none') {
      const { filePath, content } = generateCiWorkflow(ciProvider, 'playwright');
      if (filePath && content) {
          await fs.ensureDir(path.join(projectPath, path.dirname(filePath)));
          await fs.writeFile(path.join(projectPath, filePath), content);
      }
  }
}

module.exports = { createPlaywrightProject };
