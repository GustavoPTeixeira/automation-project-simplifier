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
            basePackage.scripts['test:ui'] = 'cypress run --spec "cypress/e2e/**/*.cy.*" --exclude "**/api/**"';
        }

        if(testTypes.includes('backend')){
            basePackage.scripts['test:api'] = 'cypress run --spec "cypress/e2e/api/**/*.cy.*"';
        }

        basePackage.devDependencies = {
            'cypress': '^12.0.0',
            'dotenv': '^16.0.0'
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
          }
    }

    return basePackage;
}

module.exports = { generatePackageJson };