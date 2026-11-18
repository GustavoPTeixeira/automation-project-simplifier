const fs = require('fs-extra');
const path = require('path');

async function listFiles(dir) {
    const files = [];
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules') files.push(...(await listFiles(fullPath)));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Formats every generated file with Prettier, using the project's own .prettierrc and
 * .prettierignore, so `npm run format:check` passes on a freshly generated project.
 * Files Prettier has no parser for (Jenkinsfile, .gitignore, .env.*) are left untouched.
 */
async function formatProject(projectPath) {
    const prettier = require('prettier');
    const ignorePath = path.join(projectPath, '.prettierignore');

    for (const file of await listFiles(projectPath)) {
        const { ignored, inferredParser } = await prettier.getFileInfo(file, { ignorePath });
        if (ignored || !inferredParser) continue;

        const options = (await prettier.resolveConfig(file)) || {};
        const source = await fs.readFile(file, 'utf8');
        const formatted = await prettier.format(source, { ...options, filepath: file });
        if (formatted !== source) {
            await fs.writeFile(file, formatted);
        }
    }
}

module.exports = { formatProject };
