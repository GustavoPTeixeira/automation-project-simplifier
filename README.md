# 🚀 Automation Project Simplifier

> An AI-ready CLI tool that scaffolds complete, production-grade automated testing projects using **Playwright**, **Cypress**, or **WebdriverIO** with POM & SOM architecture.

[![npm version](https://img.shields.io/npm/v/@nerojridder/test-framework-cli.svg)](https://www.npmjs.com/package/@nerojridder/test-framework-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 🧰 Key Features

* **Multi-Framework:** Full support for **Playwright**, **Cypress**, or **WebdriverIO (v9)**.
* **Multi-Language:** First-class **TypeScript** (with `tsconfig.json` & typings) or modern **JavaScript**.
* **Hybrid Testing Architecture:** Out-of-the-box support for **Frontend (UI)** and **Backend (API)** tests in the same project.
* **High-Level POM & SOM Foundation:**
  * `BasePage`: Encapsulates navigation, element interactions, and visibility assertions.
  * `BaseService`: Encapsulates HTTP client methods (`GET`, `POST`, `PUT`, `DELETE`).
* **Multi-Cloud CI/CD Pipelines:** Automatically generates production-ready pipelines for:
  * GitHub Actions (`.github/workflows/e2e.yml`)
  * GitLab CI/CD (`.gitlab-ci.yml`)
  * Azure DevOps (`azure-pipelines.yml`)
  * Bitbucket Pipelines (`bitbucket-pipelines.yml`)
  * Jenkins (`Jenkinsfile`)
* **Rich Test Reporting & Artifacts:**
  * Playwright HTML report + failure screenshot/video retention.
  * Cypress Mochawesome HTML reporter with inline assets & failure screenshots.
  * WebdriverIO automatic failure screenshot capture via `afterTest` hook.
* **Multi-Environment Support:**
  * Pre-configured templates: `.env.example`, `.env.staging.example`, and `.env.prod.example`.
  * Dynamic environment resolution via `TEST_ENV` and cross-platform execution (`npm run test:staging`, `npm run test:prod`).
* **Linting & Code Quality:**
  * Pre-configured `ESLint` (`eslint:recommended`, Mocha globals, TypeScript rules).
  * `Prettier` with `.prettierrc` and `.prettierignore`.
  * Pre-defined scripts: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`.
* **Dynamic Test Data Factories:**
  * Generates `user-factory` powered by `@faker-js/faker` to eliminate flaky test collisions and hardcoded data.
* **AI-Native & MCP (Model Context Protocol) Ready:**
  * Generates `.mcp.json` with Puppeteer MCP server support for AI IDEs (Antigravity, Cursor, Claude Code, Copilot).
  * Includes `AI_TESTING.md` architectural guidelines for AI coding assistants.
* **Custom Dependencies On-The-Fly:**
  * Install extra packages and dev-packages directly during scaffolding via `--deps` and `--dev-deps`.

---

## 📦 Installation

Install globally from npm:

```bash
npm install -g @nerojridder/test-framework-cli
```

Or run via `npx` without installing:

```bash
npx @nerojridder/test-framework-cli create my-automation-tests
```

Or run from a local clone:

```bash
git clone https://github.com/nerojridder/automation-project-simplifier.git
cd automation-project-simplifier
npm install
npm link
```

---

## 🚀 Usage

### 1. Interactive Mode

Run the command and follow the interactive prompts:

```bash
automation-simplifier create <project-name>
```

You will be prompted for:
1. **Framework**: `playwright`, `cypress`, or `webdriverio`.
2. **Language**: `typescript` or `javascript`.
3. **Test Types**: `Frontend (UI)` and/or `Backend (API)`.
4. **CI/CD Provider**: `GitHub Actions`, `GitLab CI/CD`, `Azure DevOps`, `Bitbucket Pipelines`, `Jenkins`, or `None`.
5. **Examples**: Whether to generate sample POM/SOM and tests.
6. **Extra Dependencies**: Additional runtime packages (space-separated, optional).
7. **Extra DevDependencies**: Additional dev packages (space-separated, optional).

### 2. 100% Non-Interactive Mode (CI / Scripting)

Pass flags directly to bypass all prompts:

```bash
automation-simplifier create my-tests \
  --framework playwright \
  --language typescript \
  --test-types frontend,backend \
  --ci github \
  --examples \
  --deps "axios lodash" \
  --dev-deps "allure-playwright"
```

#### Available CLI Flags:

| Flag | Description | Options |
|---|---|---|
| `-f, --framework <name>` | Test framework | `cypress`, `playwright`, `webdriverio` |
| `-l, --language <lang>` | Programming language | `javascript`, `typescript` |
| `-t, --test-types <types>` | Test types separated by comma | `frontend`, `backend`, `frontend,backend` |
| `--ci <provider>` | CI/CD pipeline provider | `github`, `gitlab`, `azure`, `bitbucket`, `jenkins`, `none` |
| `--no-ci` | Skip CI/CD pipeline generation | - |
| `--examples` / `--no-examples` | Include or skip sample POM/SOM & test files | - |
| `--deps <packages...>` | Custom runtime dependencies | Space-separated list (e.g. `axios lodash`) |
| `--dev-deps <packages...>` | Custom development dependencies | Space-separated list (e.g. `allure-playwright`) |

---

## 📁 Generated Project Structure (Playwright Example)

```
my-tests/
├── .github/workflows/e2e.yml   # CI/CD Pipeline
├── fixtures/
│   ├── users.ts                # Static fixtures
│   └── user-factory.ts         # Dynamic Faker data factory
├── pages/
│   ├── BasePage.ts             # Foundation Page Object
│   └── LoginPage.ts            # Example Page Object
├── services/
│   ├── BaseService.ts          # Foundation API Service Object
│   └── UserService.ts          # Example API Service
├── tests/
│   ├── login.spec.ts           # Frontend UI test
│   └── api/users.spec.ts       # Backend API test
├── .env.example                # Local environment template
├── .env.staging.example        # Staging environment template
├── .env.prod.example           # Production environment template
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore list
├── .mcp.json                   # Model Context Protocol browser tools
├── AI_TESTING.md               # Guidelines for AI coding assistants
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Scripts & dependencies
```

---

## 🏃 Running Tests in Generated Projects

Once generated, navigate to the project and install dependencies:

```bash
cd my-tests
npm install
```

### Pre-configured Scripts:

```bash
# Run tests
npm test

# Run tests with UI / Headed mode
npm run test:ui
npm run test:headed

# Run tests against specific environments
npm run test:staging
npm run test:prod

# Code quality & formatting
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

---

## 🧪 Development & Testing the CLI

To run the CLI unit test suite:

```bash
npm test
```

Verifies all combinations of frameworks, languages, CI providers, reporting, environment switching, linting, data factories, and custom dependencies.

---

## 📄 License

[MIT](LICENSE)
