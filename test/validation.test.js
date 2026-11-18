const test = require('node:test');
const assert = require('node:assert');

const { parsePackages, validateProjectName } = require('../src/utils/validation');

test('parsePackages splits specs inside array items (commander variadic: --deps "a b")', () => {
    assert.deepEqual(parsePackages(['axios lodash@^4.17.21']), { axios: 'latest', lodash: '^4.17.21' });
    assert.deepEqual(parsePackages(['axios', 'lodash']), { axios: 'latest', lodash: 'latest' });
    assert.deepEqual(parsePackages('axios,lodash  dayjs'), { axios: 'latest', lodash: 'latest', dayjs: 'latest' });
});

test('parsePackages handles scoped packages with and without versions', () => {
    assert.deepEqual(
        parsePackages('@types/node @types/lodash@^4.17.0'),
        { '@types/node': 'latest', '@types/lodash': '^4.17.0' }
    );
});

test('parsePackages accepts legacy registry names with uppercase letters', () => {
    assert.deepEqual(parsePackages('JSONStream'), { JSONStream: 'latest' });
});

test('parsePackages returns an empty map for empty input', () => {
    assert.deepEqual(parsePackages(''), {});
    assert.deepEqual(parsePackages(undefined), {});
    assert.deepEqual(parsePackages([]), {});
});

test('parsePackages rejects specs that are not registry package names', () => {
    for (const spec of ['github:user/repo', 'https://example.com/pkg.tgz', '../local-pkg', '.hidden', '_private', 'foo/bar']) {
        assert.throws(() => parsePackages(spec), /inválido/, spec);
    }
});

test('validateProjectName accepts valid npm package names', () => {
    for (const name of ['my-tests', 'e2e.suite', 'tests_v2', 'qa']) {
        assert.equal(validateProjectName(name), null, name);
    }
});

test('validateProjectName rejects paths, invalid npm names and reserved names', () => {
    for (const name of ['../escaped', 'a/b', 'a\\b', '.', '..', 'My Tests', 'UPPER', '_x', '', ' ', 'con', 'node_modules']) {
        assert.ok(validateProjectName(name), `expected "${name}" to be rejected`);
    }
    assert.match(validateProjectName('My Tests'), /"my-tests"/);
});
