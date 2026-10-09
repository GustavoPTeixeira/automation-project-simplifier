# Test Framework CLI

A CLI tool that generates a complete boilerplate for automated testing projects using either Cypress or Playwright.

## 🔡 About This Project

This command-line utility was built to accelerate the initial setup of an automation testing project. With a single command, it asks interactive questions and creates the entire folder structure, configuration files, and code examples, letting you start testing in seconds.

## 🧰 Features

* **Multi-Framework:** Choose between **Cypress** or **Playwright**.
* **Multi-Language:** Full support for **TypeScript** or **JavaScript**.
* **Hybrid Structure:** Generates a setup ready for both **Frontend (UI)** and **Backend (API)** tests in the same project.
* **Smart Boilerplate:**
    * Creates a `package.json` with the correct dependencies and scripts.
    * Configures `cypress.config.js` / `playwright.config.js` (or `.ts`).
    * Adds `tsconfig.json` (if TypeScript is selected).
    * Generates **Page Objects (POM)** and **Service Objects (SOM)** examples.
    * Includes a `.gitignore` and `.env.example` file.

## 📦 Installation

Install it globally from npm:

```bash
npm install -g @nerojridder/test-framework-cli
```

Or, to run it from a local clone of this repository:

```bash
npm install
npm link
```

Either way, the command is `automation-simplifier`.

## 🚀 Usage

```bash
automation-simplifier create <your-project-name>
```

The CLI prompts (in Portuguese) for:

1. The test framework: `cypress` or `playwright`.
2. The language: `javascript` or `typescript`.
3. The test types: `Frontend (UI)` and/or `Backend (API)` (at least one is required).
4. Whether to include example files (POM/SOM and tests).

# You can also pass flags directly to skip prompts:
automation-simplifier create <your-project-name> --framework playwright --language typescript --test-types frontend,backend --examples

Then install the generated project's dependencies:

```bash
cd <your-project-name>
npm install
```

## 🧪 Development

```bash
npm test
```

Runs a smoke test that generates all four framework/language combinations and checks the output.

## 📄 License

MIT
