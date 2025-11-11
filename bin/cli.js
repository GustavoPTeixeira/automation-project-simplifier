#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const { createCypressProject } = require('../src/generators/cypress-generator');
const { createPlaywrightProject } = require('../src/generators/playwright-generator');

const program = new Command();

program
    .version('1.0.0')
    .description('CLI para geração de testes automatizados em Playwright ou Cypress possibilitando o uso da estrutura POM e SOM')

program
    .command('create')
    .alias('new')
    .description('Criar um novo projeto de testes automatizados')
    .argument('<project-name>', 'Nome do projeto a ser criado')
    .action(async (projectName) => {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'framework',
                message: 'Selecione o framework de teste:',
                choices: ['cypress', 'playwright'],
            },
            {
                type: 'list',
                name: 'language',
                message: 'Selecione a linguagem de programação:',
                choices: ['javascript', 'typescript'],
            },
            {
                type: 'checkbox',
                name: 'testTypes',
                message: 'Quais dos tipos de testes você deseja adicionar a seu projeto?',
                choices: [
                    { name: 'Frontend (UI)', value: 'frontend' },
                    { name: 'Backend (API)', value: 'backend' },
                ],
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
            },
        ]);

        const projectPath = path.join(process.cwd(), projectName);
        const options = {
            projectName: projectName,
            testTypes: answers.testTypes,
            language: answers.language,
            includeExamples: answers.includeExamples,
        }

        const spinner = ora(`Criando seu projeto ${chalk.bold(projectName)}, aguarde um momento... `).start();

        try{
            if(answers.framework === 'cypress'){
                await createCypressProject(projectPath, options);
            } else if(answers.framework === 'playwright'){
                await createPlaywrightProject(projectPath, options);
            }

            spinner.succeed(chalk.green(`Projeto ${chalk.bold(projectName)} criado com sucesso em ${chalk.italic(projectPath)}`));
            console.log(chalk.white('Para iniciar, execute os seguintes comandos:'));
            console.log(chalk.cyan(`  cd ${projectName}`));
            console.log(chalk.cyan('  npm install'));
        } catch (error){
            spinner.fail(chalk.red('Ocorreu um erro ao criar o projeto: ' + error.message));
            console.error(error);
        }
})

program.parse(process.argv);
