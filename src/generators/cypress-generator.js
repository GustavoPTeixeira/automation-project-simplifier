const fs = require('fs-extra')
const path = require('path')
const { generatePackageJson } = require('../templates/package-json')
const { generateCypressConfig } = require('../templates/cypress-config.js')
const { generatePageObject } = require('../templates/page-object')
const { generateServiceObject } = require('../templates/service-object')
const { generateFrontendTest } = require('../templates/frontend-test')
const { generateBackendTest } = require('../templates/backend-test')

async function createCypressProject(projectPath, options){
    const { projectName, testTypes, language, includeExamples } = options
    const isTS = language === 'typescript'

    const directories = [
        'cypress/e2e',
        'cypress/fixtures',
        'cypress/support'
    ];

    if(testTypes.includes('frontend')){
        directories.push('cypress/pages')
    }

    if(testTypes.includes('backend')){
        directories.push('cypress/services')
    }

    for(const dir of directories){
        await fs.ensureDir(path.join(projectPath, dir))
    }

    const packageJson = generatePackageJson({
        projectName,
        framework: 'cypress',
        language,
        testTypes
    });

    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 })

    const configFile = `cypress.config.${isTS ? 'ts' : 'js'}`;
    const cypressConfig = generateCypressConfig(language, testTypes);
    await fs.writeFile(path.join(projectPath, configFile), cypressConfig);

    if(isTS){
        const tsConfig = {
            compilerOptions: {
                target: "ES2020",
                lib: ["ES2020", "DOM"],
                types: ["cypress", "node"],
                module: "commonJS",
                moduleResolution: "node",
                esModuleInterop: true,
                resolveJsonModule: true,
                strict: true,
                skipLibCheck: true,
            },
            include: ["cypress/**/*"]
        };
        await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
    }

    const supportFile = `cypress/support/e2e.${isTS ? 'ts' : 'js'}`;
    const supportContent = isTS ? `// Cypress support file\nimport './commands';\n` : `// Cypress support file\nimport './commands';\n`
    await fs.writeFile(path.join(projectPath, supportFile), supportContent);
    
    const commandsFile = `cypress/support/commands.${isTS ? 'ts' : 'js'}`;
    const commandsContents = `Cypress.Commands.add('login', (username${isTS ? ': string' : ''}, password${isTS ? ': string' : ''}) => {
        cy.session([username, password], () => {
          cy.visit('/login');
          cy.get('[data-cy="username"]').type(username);
          cy.get('[data-cy="password"]').type(password);
          cy.get('[data-cy="login-button"]').click();
          cy.url().should('not.include', '/login');
        });
      })`;
    await fs.writeFile(path.join(projectPath, commandsFile), commandsContents);

    if(includeExamples){
        if(testTypes.includes('frontend')){
            const pageObjectFile = `cypress/pages/LoginPage.${isTS ? 'ts' : 'js'}`;
            const pageObjectContent = generatePageObject(language, 'cypress');
            await fs.writeFile(path.join(projectPath, pageObjectFile), pageObjectContent);

            const frontendTestFile = `cypress/e2e/login.cy.${isTS ? 'ts' : 'js'}`;
            const frontendTestContent = generateFrontendTest(language, 'cypress');
            await fs.writeFile(path.join(projectPath, frontendTestFile), frontendTestContent);
        }

        if(testTypes.includes('backend')){
            const serviceObjectFile = `cypress/services/UserService.${isTS ? 'ts' : 'js'}`;
            const serviceObjectContent = generateServiceObject(language, 'cypress');
            await fs.writeFile(path.join(projectPath, serviceObjectFile), serviceObjectContent);

            const backendTestFile = `cypress/e2e/api/users.cy.${isTS ? 'ts' : 'js'}`;
            await fs.ensureDir(path.join(projectPath, 'cypress/e2e/api'));
            const backendTestContent = generateBackendTest(language, 'cypress');
            await fs.writeFile(path.join(projectPath, backendTestFile), backendTestContent);
        }
    }
    const fixtureExamplo = {
        users: [
            { username: 'testuser', password: 'password123', email: 'test@example.com' }
        ]
    }
    await fs.writeJson(path.join(projectPath, 'cypress/fixtures/users.json'), fixtureExamplo, { spaces: 2 });

    const gitignore = `
    node_modules
    cypress/videos
    cypress/screenshots
    cypress/downloads
    .env
    *.log
    dist/
    .DS_Store
    `;
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

    const envExample = `
    # URL base da aplicação
    CYPRESS_BASE_URL=http://localhost:3000
    # URL base da API
    CYPRESS_API_URL=http://localhost:3000/api
    # Credenciais de teste
    TEST_USERNAME=testuser
    TEST_PASSWORD=password123
    `;
    await fs.writeFile(path.join(projectPath, '.env.example'), envExample);
      
}

module.exports = { createCypressProject };