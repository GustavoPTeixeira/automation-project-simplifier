function parsePackages(input) {
    if (!input) return {};
    const list = Array.isArray(input) ? input : input.split(/\s+/).filter(Boolean);
    const result = {};

    for (const pkg of list) {
        const trimmed = pkg.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('@')) {
            const atIndex = trimmed.indexOf('@', 1);
            if (atIndex !== -1) {
                result[trimmed.slice(0, atIndex)] = trimmed.slice(atIndex + 1);
            } else {
                result[trimmed] = 'latest';
            }
        } else if (trimmed.includes('@')) {
            const [name, version] = trimmed.split('@');
            result[name] = version || 'latest';
        } else {
            result[trimmed] = 'latest';
        }
    }

    return result;
}

function generatePackageJson(options){
    const { projectName, framework, language, testTypes } = options;
    const isTS = language === 'typescript';

    const basePackage = {
        name: projectName,
        version: '1.0.0',
        description: `Projeto de testes automatizados com ${framework}`,
        scripts: {},
        keywords: ['testing', 'automation', framework, 'pom', 'som'],
        author: 'Nero James Ridder',
        license: 'MIT',
        devDependencies: {}
    };

    if(framework === 'cypress'){
        basePackage.scripts = {
            'cypress:open': 'cypress open',
            'cypress:run': 'cypress run',
            'test': 'cypress run',
            'test:headed': 'cypress run --headed',
            'test:chrome': 'cypress run --browser chrome',
        }
        if(testTypes.includes('frontend')){
            basePackage.scripts['test:ui'] = 'cypress run --spec "cypress/e2e/*.cy.*"';
        }

        if(testTypes.includes('backend')){
            basePackage.scripts['test:api'] = 'cypress run --spec "cypress/e2e/api/**/*.cy.*"';
        }

        basePackage.devDependencies = {
            'cypress': '^16.0.0',
            'cypress-mochawesome-reporter': '^3.8.2',
            'dotenv': '^18.0.0'
        };

        if(isTS){
            basePackage.devDependencies['typescript'] = '^5.3.3';
            basePackage.devDependencies['@types/node'] = '^20.10.0';
        }
    } else if (framework === 'playwright'){
        basePackage.scripts = {
            'test': 'playwright test',
            'test:headed': 'playwright test --headed',
            'test:ui': 'playwright test --ui',
            'test:debug': 'playwright test --debug',
            'test:chrome': 'playwright test --project=chromium',
            'test:firefox': 'playwright test --project=firefox',
            'test:safari': 'playwright test --project=webkit',
            'report': 'playwright show-report'
          };

          if (testTypes.includes('backend')) {
            basePackage.scripts['test:api'] = 'playwright test tests/api';
          }

          basePackage.devDependencies = {
            '@playwright/test': '^1.40.0',
            'dotenv': '^16.3.1'
          };

          if (isTS) {
            basePackage.devDependencies['typescript'] = '^5.3.3';
            basePackage.devDependencies['@types/node'] = '^20.10.0';
          }
    } else if (framework === 'webdriverio'){
        const configFile = `./wdio.conf.${isTS ? 'ts' : 'js'}`;

        basePackage.scripts = {
            'wdio': `wdio run ${configFile}`,
            'test': `wdio run ${configFile}`,
            'test:headed': `HEADED=true wdio run ${configFile}`,
        };

        if(testTypes.includes('frontend')) {
            basePackage.scripts['test:ui'] = `wdio run ${configFile} --spec "tests/specs/*.e2e.*"`;
        }

        if(testTypes.includes('backend')){
            basePackage.scripts['test:api'] = `wdio run ${configFile} --spec "tests/specs/api/*.api.*"`;
        }

        basePackage.devDependencies = {
            '@wdio/cli': '^9.0.0',
            '@wdio/local-runner': '^9.0.0',
            '@wdio/mocha-framework': '^9.0.0',
            '@wdio/spec-reporter': '^9.0.0',
            'dotenv': '^16.4.5'
        }

        if(isTS){
            basePackage.devDependencies['typescript'] = '^5.3.3';
            basePackage.devDependencies['@types/node'] = '^20.10.0';
            basePackage.devDependencies['ts-node'] = '^10.9.2';
        }
    }

    basePackage.scripts['test:staging'] = 'cross-env TEST_ENV=staging npm test';
    basePackage.scripts['test:prod'] = 'cross-env TEST_ENV=prod npm test';
    basePackage.scripts['lint'] = 'eslint .';
    basePackage.scripts['lint:fix'] = 'eslint . --fix';
    basePackage.scripts['format'] = 'prettier --write .';
    basePackage.scripts['format:check'] = 'prettier --check .';

    basePackage.devDependencies['cross-env'] = '^7.0.3';
    basePackage.devDependencies['eslint'] = '^8.56.0';
    basePackage.devDependencies['prettier'] = '^3.2.5';
    basePackage.devDependencies['eslint-config-prettier'] = '^9.1.0';
    basePackage.devDependencies['@faker-js/faker'] = '^8.4.1';

    if (isTS) {
        basePackage.devDependencies['@typescript-eslint/parser'] = '^6.21.0';
        basePackage.devDependencies['@typescript-eslint/eslint-plugin'] = '^6.21.0';
    }

    if (options.dependencies) {
        basePackage.dependencies = {
            ...(basePackage.dependencies || {}),
            ...parsePackages(options.dependencies),
        };
    }

    if (options.devDependencies) {
        basePackage.devDependencies = {
            ...(basePackage.devDependencies || {}),
            ...parsePackages(options.devDependencies),
        };
    }
    
    return basePackage;
}

module.exports = { generatePackageJson };
