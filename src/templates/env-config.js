function generateEnvContent(framework, env = 'local') {
    const isCypress = framework === 'cypress';
    const isWdio = framework === 'webdriverio';

    const baseUrlKey = isCypress ? 'CYPRESS_BASE_URL' : 'BASE_URL';
    const apiUrlKey = isCypress ? 'CYPRESS_API_URL' : 'API_URL';

    const envData = {
        local: {
            baseUrl: 'http://localhost:3000',
            apiUrl: 'http://localhost:3000/api',
            username: 'testuser',
            password: 'password123',
        },
        staging: {
            baseUrl: 'https://staging.example.com',
            apiUrl: 'https://staging-api.example.com',
            username: 'staging_user',
            password: 'staging_password123',
        },
        prod: {
            baseUrl: 'https://example.com',
            apiUrl: 'https://api.example.com',
            username: 'prod_smoke_user',
            password: 'prod_password123',
        },
    };

    const target = envData[env] || envData.local;

    let content = `# Configurações de Ambiente: ${env.toUpperCase()}
${baseUrlKey}=${target.baseUrl}
${apiUrlKey}=${target.apiUrl}

# Credenciais de teste
TEST_USERNAME=${target.username}
TEST_PASSWORD=${target.password}
`;

    if (isWdio) {
        content += `\n# Configurações do WebdriverIO\nHEADED=false\n`;
    }

    return content;
}

module.exports = { generateEnvContent };