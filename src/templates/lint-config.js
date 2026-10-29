function generateEslintConfig(framework, language) {
    const isTS = language === 'typescript';

     const env = {
        node: true,
        es2021: true,
    };
    if (framework === 'cypress' || framework === 'webdriverio') {
        env.mocha = true;
    }
    const globals = {};
    if (framework === 'cypress') {
        globals.cy = 'readonly';
        globals.Cypress = 'readonly';
    }
    const config = {
        env,
        globals,
        extends: ['eslint:recommended', 'prettier'],
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
        },
    };

    if (isTS) {
        config.parser = '@typescript-eslint/parser';
        config.plugins = ['@typescript-eslint'];
        config.extends = [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'prettier',
        ];
        config.rules = {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': 'off',
        };
    }

    return config;
}

function generatePrettierConfig() {
    return {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 100,
    };
}

function generatePrettierIgnore(framework) {
    const lines = [
        'node_modules/',
        'dist/',
        '*.log',
        '.env*',
    ];

    if (framework === 'playwright') {
        lines.push('playwright-report/', 'test-results/', 'playwright/.cache/');
    } else if (framework === 'cypress') {
        lines.push('cypress/reports/', 'cypress/screenshots/', 'cypress/videos/', 'cypress/downloads/');
    } else if (framework === 'webdriverio') {
        lines.push('screenshots/');
    }

    return lines.join('\n') + '\n';
}

module.exports = {
    generateEslintConfig,
    generatePrettierConfig,
    generatePrettierIgnore,
};