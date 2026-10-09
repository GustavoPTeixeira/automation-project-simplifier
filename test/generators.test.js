const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const { createCypressProject } = require('../src/generators/cypress-generator');
const { createPlaywrightProject } = require('../src/generators/playwright-generator');

const combos = [
    ['cypress', createCypressProject, 'typescript'],
    ['cypress', createCypressProject, 'javascript'],
    ['playwright', createPlaywrightProject, 'typescript'],
    ['playwright', createPlaywrightProject, 'javascript'],
];

for (const [framework, create, language] of combos) {
    test(`${framework} + ${language} generates a sane project`, async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gen-'));
        try {
            await create(dir, {
                projectName: 'sample',
                testTypes: ['frontend', 'backend'],
                language,
                includeExamples: true,
            });

            const files = (await fs.readdir(dir, { recursive: true }))
                .map((f) => path.join(dir, f));

            for (const file of files) {
                if (!(await fs.stat(file)).isFile()) continue;
                const content = await fs.readFile(file, 'utf8');
                assert.ok(!content.includes('não suportado'), `placeholder content in ${file}`);
                assert.ok(!/from '[^']*\.(ts|js)'/.test(content), `import with extension in ${file}`);
                if (file.endsWith('.json')) JSON.parse(content);
            }

            const gitignore = await fs.readFile(path.join(dir, '.gitignore'), 'utf8');
            assert.ok(!/^\s+\S/m.test(gitignore), '.gitignore has indented lines');
        } finally {
            await fs.remove(dir);
        }
    });
}

