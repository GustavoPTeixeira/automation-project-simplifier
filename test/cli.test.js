const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const CLI = path.join(__dirname, '..', 'bin', 'cli.js');
const REQUIRED_FLAGS = ['-f', 'playwright', '-l', 'typescript', '-t', 'frontend'];

// stdin is not a TTY here, exactly like in a CI job.
function runCreate(args, cwd) {
    const result = spawnSync(process.execPath, [CLI, 'create', ...args], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '0' },
    });
    return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

async function inTempCwd(fn) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-'));
    const cwd = path.join(root, 'cwd');
    await fs.ensureDir(cwd);
    try {
        await fn(cwd, root);
    } finally {
        await fs.remove(root);
    }
}

test('without a TTY, missing required flags fail fast and name them', () => inTempCwd(async (cwd) => {
    const { code, output } = runCreate(['proj', '-f', 'playwright'], cwd);
    assert.equal(code, 1);
    assert.match(output, /--language, --test-types/);
    assert.ok(!(await fs.pathExists(path.join(cwd, 'proj'))));
}));

test('without a TTY, the required flags are enough: optional settings use defaults', () => inTempCwd(async (cwd) => {
    const { code, output } = runCreate(['proj', ...REQUIRED_FLAGS], cwd);
    assert.equal(code, 0, output);
    assert.ok(await fs.pathExists(path.join(cwd, 'proj/.github/workflows/e2e.yml')), 'default CI provider not applied');
    assert.ok(await fs.pathExists(path.join(cwd, 'proj/tests/login.spec.ts')), 'default examples not applied');
}));

test('--yes requires the same flags as a non-interactive run', () => inTempCwd(async (cwd) => {
    const { code, output } = runCreate(['proj', '--yes', '-f', 'cypress'], cwd);
    assert.equal(code, 1);
    assert.match(output, /--yes.*--language, --test-types/);
}));

test('--deps "a b" (one quoted argument) becomes separate dependencies', () => inTempCwd(async (cwd) => {
    const { code, output } = runCreate(
        ['proj', ...REQUIRED_FLAGS, '--no-examples', '--deps', 'axios lodash@^4.17.21', '--dev-deps', 'allure-playwright'],
        cwd
    );
    assert.equal(code, 0, output);
    const pkg = await fs.readJson(path.join(cwd, 'proj/package.json'));
    assert.deepEqual(pkg.dependencies, { axios: 'latest', lodash: '^4.17.21' });
    assert.equal(pkg.devDependencies['allure-playwright'], 'latest');
}));

test('invalid dependency specs are rejected before anything is written', () => inTempCwd(async (cwd) => {
    const { code, output } = runCreate(['proj', ...REQUIRED_FLAGS, '--deps', 'github:user/repo'], cwd);
    assert.equal(code, 1);
    assert.match(output, /github:user\/repo/);
    assert.ok(!(await fs.pathExists(path.join(cwd, 'proj'))));
}));

test('project names that leave the current directory or are invalid npm names are rejected', () => inTempCwd(async (cwd, root) => {
    for (const name of ['../escaped', 'My Tests']) {
        const { code, output } = runCreate([name, ...REQUIRED_FLAGS], cwd);
        assert.equal(code, 1, `${name}: ${output}`);
        assert.match(output, /Nome de projeto inválido/);
    }
    assert.ok(!(await fs.pathExists(path.join(root, 'escaped'))), 'wrote outside the current directory');
    assert.ok(!(await fs.pathExists(path.join(cwd, 'My Tests'))));
}));
