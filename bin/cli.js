#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { createCypressProject } = require('../src/generators/cypress-generator');
const { createPlaywrightProject } = require('../src/generators/playwright-generator');
const { createWdioProject } = require('../src/generators/wdio-generator');
const { validateProjectName, parsePackages } = require('../src/utils/validation');

const FRAMEWORKS = ['cypress', 'playwright', 'webdriverio'];
const LANGUAGES = ['javascript', 'typescript'];
const TEST_TYPES = ['frontend', 'backend'];
const CI_PROVIDERS = ['github', 'gitlab', 'azure', 'bitbucket', 'jenkins', 'none'];

// Used for the optional settings when nobody can be prompted (--yes, or no interactive terminal).
const NON_INTERACTIVE_DEFAULTS = {
    ciProvider: 'github',
    includeExamples: true,
    dependencies: '',
    devDependencies: '',
};

function packagesInputError(input) {
    try {
        parsePackages(input);
        return null;
    } catch (error) {
        return error.message;
    }
}

const program = new Command();

program
    .version(require('../package.json').version)
    .description('CLI para geração de testes automatizados em Playwright, Cypress ou WebdriverIO possibilitando o uso da estrutura POM e SOM')

program
    .command('create')
    .alias('new')
    .description('Criar um novo projeto de testes automatizados')
    .argument('<project-name>', 'Nome do projeto a ser criado (pasta no diretório atual e nome do pacote npm)')
    .option('-f, --framework <framework>', 'Framework de teste (cypress, playwright, webdriverio)')
    .option('-l, --language <language>', 'Linguagem (javascript, typescript)')
    .option('-t, --test-types <types>', 'Tipos de testes separados por vírgula (frontend, backend)')
    .option('--examples', 'Incluir exemplos de testes')
    .option('--no-examples', 'Não incluir exemplos de testes')
    .option('--ci <provider>', 'Provedor de CI/CD (github, gitlab, azure, bitbucket, jenkins, none)')
    .option('--no-ci', 'Não incluir pipeline de CI/CD')
    .option('--deps <packages...>', 'Dependências extras separadas por espaço (ex: axios lodash)')
    .option('--dev-deps <packages...>', 'DevDependencies extras separadas por espaço (ex: allure-playwright)')
    .option('-y, --yes', 'Não fazer perguntas: usa os padrões para as opções omitidas (CI: github, exemplos: sim, sem dependências extras)')
    .action(async (projectName, cmdOptions) => {
        const inquirer = (await import('inquirer')).default;
        const chalk = (await import('chalk')).default;
        const ora = (await import('ora')).default;

        const fail = (message) => {
            console.error(chalk.red(message));
            process.exitCode = 1;
        };

        const nameError = validateProjectName(projectName);
        if(nameError){
            return fail(nameError);
        }

        const projectPath = path.join(process.cwd(), projectName);
        if(await fs.pathExists(projectPath)){
            const existing = await fs.readdir(projectPath);
            if(existing.length > 0){
                return fail(`A pasta "${projectName}" já existe e não está vazia. Escolha outro nome.`);
            }
        }

        if(cmdOptions.framework && !FRAMEWORKS.includes(cmdOptions.framework.toLowerCase())){
            return fail(`Framework inválido: "${cmdOptions.framework}". Escolha "cypress", "playwright" ou "webdriverio".`);
        }

        if(cmdOptions.language && !LANGUAGES.includes(cmdOptions.language.toLowerCase())){
            return fail(`Linguagem inválida: "${cmdOptions.language}". Escolha "javascript" ou "typescript".`);
        }

        let parsedTestTypes = null;
        if(cmdOptions.testTypes){
            parsedTestTypes = cmdOptions.testTypes
                .split(',')
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
            const invalid = parsedTestTypes.filter((t) => !TEST_TYPES.includes(t));
            if(invalid.length > 0 || parsedTestTypes.length === 0){
                return fail(`Tipo(s) de teste inválido(s): "${cmdOptions.testTypes}". Escolha "frontend", "backend" ou "frontend,backend".`);
            }
        }

        if(cmdOptions.ci && typeof cmdOptions.ci === 'string' && !CI_PROVIDERS.includes(cmdOptions.ci.toLowerCase())){
            return fail(`Provedor de CI/CD inválido: "${cmdOptions.ci}". Escolha entre: ${CI_PROVIDERS.join(', ')}.`);
        }

        for (const [flag, value] of [['--deps', cmdOptions.deps], ['--dev-deps', cmdOptions.devDeps]]) {
            const error = packagesInputError(value);
            if (error) {
                return fail(`${flag}: ${error}`);
            }
        }

        // Prompting without a terminal (CI, pipes) makes inquirer exit silently with code 1,
        // so only prompt when someone can answer. Otherwise the choices without a sensible
        // default must come from flags.
        const interactive = Boolean(process.stdin.isTTY) && !cmdOptions.yes;
        if(!interactive){
            const missing = [];
            if(!cmdOptions.framework) missing.push('--framework');
            if(!cmdOptions.language) missing.push('--language');
            if(!parsedTestTypes) missing.push('--test-types');
            if(missing.length > 0){
                const reason = cmdOptions.yes
                    ? 'Com --yes, informe também'
                    : 'Não há um terminal interativo para perguntar as opções. Informe';
                return fail(`${reason}: ${missing.join(', ')}.`);
            }
        }

        const answers = !interactive ? NON_INTERACTIVE_DEFAULTS : await inquirer.prompt([
            {
                type: 'list',
                name: 'framework',
                message: 'Selecione o framework de teste:',
                choices: FRAMEWORKS,
                when: () => !cmdOptions.framework,
            },
            {
                type: 'list',
                name: 'language',
                message: 'Selecione a linguagem de programação:',
                choices: LANGUAGES,
                when: () => !cmdOptions.language,
            },
            {
                type: 'checkbox',
                name: 'testTypes',
                message: 'Quais dos tipos de testes você deseja adicionar a seu projeto?',
                choices: [
                    { name: 'Frontend (UI)', value: 'frontend' },
                    { name: 'Backend (API)', value: 'backend' },
                ],
                when: () => !parsedTestTypes,
                validate: (input) =>{
                    if(input.length === 0){
                        return 'Você deve selecionar ao menos um tipo de teste.';
                    }
                    return true;
                },
            },
            {
                type: 'list',
                name: 'ciProvider',
                message: 'Selecione o provedor de CI/CD:',
                choices: [
                    { name: 'GitHub Actions', value: 'github' },
                    { name: 'GitLab CI/CD', value: 'gitlab' },
                    { name: 'Azure DevOps Pipelines', value: 'azure' },
                    { name: 'Bitbucket Pipelines', value: 'bitbucket' },
                    { name: 'Jenkins', value: 'jenkins' },
                    { name: 'Nenhum', value: 'none' },
                ],
                default: 'github',
                when: () => cmdOptions.ci === undefined,
            },
            {
                type: 'confirm',
                name: 'includeExamples',
                message: 'Deseja incluir exemplos de testes no projeto?',
                default: true,
                when: () => cmdOptions.examples === undefined,
            },
            {
                type: 'input',
                name: 'dependencies',
                message: 'Dependências extras para instalar (separadas por espaço, ou Enter para pular):',
                default: '',
                when: () => cmdOptions.deps === undefined,
                validate: (input) => packagesInputError(input) || true,
            },
            {
                type: 'input',
                name: 'devDependencies',
                message: 'DevDependencies extras para instalar (separadas por espaço, ou Enter para pular):',
                default: '',
                when: () => cmdOptions.devDeps === undefined,
                validate: (input) => packagesInputError(input) || true,
            },
        ]);

        const framework = (cmdOptions.framework || answers.framework).toLowerCase();
        const language = (cmdOptions.language || answers.language).toLowerCase();
        const testTypes = parsedTestTypes || answers.testTypes;
        const includeExamples = cmdOptions.examples !== undefined ? cmdOptions.examples : answers.includeExamples;
        const dependencies = cmdOptions.deps !== undefined ? cmdOptions.deps : answers.dependencies;
        const devDependencies = cmdOptions.devDeps !== undefined ? cmdOptions.devDeps : answers.devDependencies;

        let ciProvider = 'none';
        if (cmdOptions.ci === false) {
            ciProvider = 'none';
        } else if (typeof cmdOptions.ci === 'string') {
            ciProvider = cmdOptions.ci.toLowerCase();
        } else if (answers.ciProvider) {
            ciProvider = answers.ciProvider.toLowerCase();
        }

        const options = {
            projectName: projectName,
            testTypes: testTypes,
            language: language,
            includeExamples: includeExamples,
            ciProvider: ciProvider,
            dependencies: dependencies,
            devDependencies: devDependencies,
        };
        const spinner = ora(`Criando seu projeto ${chalk.bold(projectName)}, aguarde um momento... `).start();

        try{
            if(framework === 'cypress'){
                await createCypressProject(projectPath, options);
            } else if(framework === 'playwright'){
                await createPlaywrightProject(projectPath, options);
            } else if(framework === 'webdriverio'){
                await createWdioProject(projectPath, options);
            }

            spinner.succeed(chalk.green(`Projeto ${chalk.bold(projectName)} criado com sucesso em ${chalk.italic(projectPath)}`));
            console.log(chalk.white('Para iniciar, execute os seguintes comandos:'));
            console.log(chalk.cyan(`  cd ${projectName}`));
            console.log(chalk.cyan('  npm install'));
            if(!includeExamples){
                console.log(chalk.yellow('Nenhum teste de exemplo foi gerado: "npm test" (e o pipeline de CI) falha com "nenhum teste encontrado" até você adicionar o primeiro spec.'));
            }
        } catch (error){
            spinner.fail(chalk.red('Ocorreu um erro ao criar o projeto: ' + error.message));
            console.error(error);
            process.exitCode = 1;
        }
})

program.parseAsync(process.argv).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
