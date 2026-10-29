function generateMcpConfig() {
    return {
        mcpServers: {
            puppeteer: {
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-puppeteer']
            }
        }
    };
}

function generateAiInstructions(framework, language) {
    const isTS = language === 'typescript';
    const ext = isTS ? 'ts' : 'js';

    return `# 🤖 AI Agent Guidelines for Test Automation

This project is an automated testing framework built with **${framework.toUpperCase()}** and **${language.toUpperCase()}**.
AI assistants (Antigravity, Cursor, Claude Code, GitHub Copilot) MUST adhere to the following architecture rules when creating or modifying tests.

---

## 🏛️ Architecture & Best Practices

1. **Page Object Model (POM)**:
   - All UI pages must reside in \`pages/\` (or \`cypress/pages/\`) and extend \`BasePage\`.
   - Never write raw browser commands directly in test files. Encapsulate selectors and actions inside Page Objects.

2. **Service Object Model (SOM)**:
   - All API clients must reside in \`services/\` (or \`cypress/services/\`) and extend \`BaseService\`.
   - Encapsulate HTTP endpoints, request payloads, and response status assertions.

3. **Dynamic Test Data**:
   - Never hardcode user credentials or test data in tests.
   - Always import and use \`createFakeUser()\` from the fixtures factory (\`user-factory.${ext}\`) to prevent data collision.

4. **Multi-Environment Support**:
   - The active environment is controlled by \`TEST_ENV\` (\`local\`, \`staging\`, \`prod\`).
   - Run tests against staging using: \`npm run test:staging\`.
   - Run tests against production using: \`npm run test:prod\`.

5. **Code Quality & Formatting**:
   - After creating or editing code, always run:
     - \`npm run lint:fix\`
     - \`npm run format\`

6. **Browser Inspection with MCP**:
   - When the \`.mcp.json\` is enabled in your AI IDE, use the Puppeteer/Playwright MCP server tools (\`navigate\`, \`click\`, \`screenshot\`) to inspect target pages and locate robust selectors.
`;
}

module.exports = {
    generateMcpConfig,
    generateAiInstructions,
};