# Test Framework CLI

A CLI tool that generates a complete boilerplate for automated testing projects using either Cypress or Playwright.

## 🔡 About This Project

This command-line utility was built to accelerate the initial setup of an automation testing project. With a single command, it asks interactive questions and creates the entire folder structure, configuration files, and code examples, letting you start testing in seconds.

## 🧰 Features

* **Multi-Framework:** Choose between **Cypress** or **Playwright**.
* **Multi-Language:** Full support for **TypeScript** or **JavaScript**.
* **Hybrid Structure:** Generates a setup ready for both **Frontend (E2E)** and **Backend (API)** tests in the same project.
* **Smart Boilerplate:**
    * Creates a `package.json` with the correct dependencies and scripts.
    * Configures `cypress.config.js` / `playwright.config.js`.
    * Adds `tsconfig.json` (if TypeScript is selected).
    * Generates **Page Objects (POM)** and **Service Objects (SOM)** examples.
    * Includes a `.gitignore` and `.env.example` file.

## 📦 Installation

To install and use this CLI globally on your machine:

```bash

# 0. For downloading it from npm, run this line 
npm install -g test-framework-cli

# 1. In this project's root, create a symbolic link
npm link

# 2. Now you can use the "automation-simplifier" command anywhere
automation-simplifier create <your-project-name>

$ create-test-project create my-test-project

? Which framework would you like to use?
❯ cypress
  playwright

? Which language do you prefer?
❯ typescript
  javascript

? What types of testing will you include? (Use Space to select)
❯ ◉ Frontend (E2E)
  ◉ Backend (API)

? Would you like to include example files (POM/SOM and tests)? (Y/n)
❯ Yes

🚀 Creating your project <your-project-name>...
🎉 Successfully created project <your-project-name>!

# After the project is created, don't forget to install its dependencies:
cd my-test-project
npm install
```



