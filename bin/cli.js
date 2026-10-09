#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { createCypressProject } = require('../src/generators/cypress-generator');
const { createPlaywrightProject } = require('../src/generators/playwright-generator');

const program = new Command();

program
    .version(require('../package.json').version)
    .description('CLI para geração de testes automatizados em Playwright ou Cypress possibilitando o uso da estrutura POM e SOM')

program
    .command('create')
    .alias('new')
    .description('Criar um novo projeto de testes automatizados')
    .argument('<project-name>', 'Nome do projeto a ser criado')
    .option('-f, --framework <framework>', 'Framework de teste (cypress, playwright)')
    .option('-l, --language <language>', 'Linguagem (javascript, typescript)')
    .option('-t, --test-types <types>', 'Tipos de testes separados por vírgula (frontend, backend)')
    .option('--examples', 'Incluir exemplos de testes')
    .option('--no-examples', 'Não incluir exemplos de testes')
    .action(async (projectName, cmdOptions) => {
        const inquirer = (await import('inquirer')).default;
        const chalk = (await import('chalk')).default;
        const ora = (await import('ora')).default;
        const projectPath = path.join(process.cwd(), projectName);
        if(await fs.pathExists(projectPath)){
            const existing = await fs.readdir(projectPath);
            if(existing.length > 0){
                console.error(chalk.red(`A pasta "${projectName}" já existe e não está vazia. Escolha outro nome.`));
                process.exitCode = 1;
                return;
            }
        }
        if(cmdOptions.framework && !['cypress', 'playwright'].includes(cmdOptions.framework.toLowerCase())){
                console.error(chalk.red(`Framework inválido: "${cmdOptions.framework}". Escolha "cypress" ou "playwright".`));
                process.exitCode = 1;
                return;
        }

        if(cmdOptions.language && !['javascript', 'typescript'].includes(cmdOptions.language.toLowerCase())){
                console.error(chalk.red(`Linguagem inválida: "${cmdOptions.language}". Escolha "javascript" ou "typescript".`));
                process.exitCode = 1;
                return;
        }

        let parsedTestTypes = null;
        if(cmdOptions.testTypes){
            parsedTestTypes = cmdOptions.testTypes
                .split(',')
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
            const invalid = parsedTestTypes.filter((t) => !['frontend', 'backend'].includes(t));
            if(invalid.length > 0 || parsedTestTypes.length === 0){
                console.error(chalk.red(`Tipo(s) de teste inválido(s): "${cmdOptions.testTypes}". Escolha "fronten", "backend" ou "frontend,backend".`));
                process.exitCode = 1;
                return;
            }
        }
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'framework',
                message: 'Selecione o framework de teste:',
                choices: ['cypress', 'playwright'],
                when: () => !cmdOptions.framework,
            },
            {
                type: 'list',
                name: 'language',
                message: 'Selecione a linguagem de programação:',
                choices: ['javascript', 'typescript'],
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
                type: 'confirm',
                name: 'includeExamples',
                message: 'Deseja incluir exemplos de testes no projeto?',
                default: true,
                when: () => cmdOptions.examples === undefined,
            },
        ]);

        const framework = (cmdOptions.framework || answers.framework).toLowerCase();
        const language = (cmdOptions.language || answers.language).toLowerCase();
        const testTypes = parsedTestTypes || answers.testTypes;
        const includeExamples = cmdOptions.examples !== undefined ? cmdOptions.examples : answers.includeExamples;
        
        const options = {
            projectName: projectName,
            testTypes: testTypes,
            language: language,
            includeExamples: includeExamples,
        }
        const spinner = ora(`Criando seu projeto ${chalk.bold(projectName)}, aguarde um momento... `).start();

        try{
            if(framework === 'cypress'){
                await createCypressProject(projectPath, options);
            } else if(framework === 'playwright'){
                await createPlaywrightProject(projectPath, options);
            }

            spinner.succeed(chalk.green(`Projeto ${chalk.bold(projectName)} criado com sucesso em ${chalk.italic(projectPath)}`));
            console.log(chalk.white('Para iniciar, execute os seguintes comandos:'));
            console.log(chalk.cyan(`  cd ${projectName}`));
            console.log(chalk.cyan('  npm install'));
        } catch (error){
            spinner.fail(chalk.red('Ocorreu um erro ao criar o projeto: ' + error.message));
            console.error(error);
            process.exitCode = 1;
        }
})

program.parse(process.argv);
