function generateProjectReadme(options = {}) {
    const {
        projectName = 'Automation Tests',
        framework = 'playwright',
        language = 'typescript',
        testTypes = [],
        ciProvider = 'none',
    } = options;

    return `# ${projectName}

> Automated testing suite built with **${(framework || '').toUpperCase()}** and **${(language || '').toUpperCase()}**.
> Scaffolded with [automation-project-simplifier](https://github.com/nerojridder/automation-project-simplifier).

---

## 🚀 Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Setup

Copy one of the environment templates to your active \`.env\` file:

\`\`\`bash
# Local development (default)
cp .env.example .env

# Or for staging
cp .env.staging.example .env

# Or for production
cp .env.prod.example .env
\`\`\`

---

## 🏃 Running Tests

| Command | Description |
|---|---|
| \`npm test\` | Run all automated tests |
| \`npm run test:headed\` | Run tests with visible browser window |
${testTypes.includes('frontend') ? '| `npm run test:ui` | Run only Frontend (UI) tests |\n' : ''}${testTypes.includes('backend') ? '| `npm run test:api` | Run only Backend (API) tests |\n' : ''}| \`npm run test:staging\` | Run tests targeted against the Staging environment |
| \`npm run test:prod\` | Run tests targeted against the Production environment |

---

## 🧹 Code Quality & Linting

| Command | Description |
|---|---|
| \`npm run lint\` | Check code with ESLint |
| \`npm run lint:fix\` | Automatically fix safe lint issues |
| \`npm run format\` | Format code using Prettier |
| \`npm run format:check\` | Verify code formatting |

---

## 🏛️ Architecture

* **Page Objects (\`pages/\`)**: Encapsulates web page elements and user interactions, extending \`BasePage\`.
* **Service Objects (\`services/\`)**: Encapsulates REST API endpoints and payloads, extending \`BaseService\`.
* **Data Factories (\`fixtures/\`)**: Generates unique, isolated dynamic test data using \`@faker-js/faker\` via \`createFakeUser()\`.
* **CI/CD Pipeline**: Configured for **${(ciProvider || 'none').toUpperCase()}**.
* **AI & MCP Ready**: Configured with \`.mcp.json\` and \`AI_TESTING.md\` for AI coding agents.
`;
}

module.exports = { generateProjectReadme };
