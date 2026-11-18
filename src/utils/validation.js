// npm package-name rules: URL-safe characters, max 214 chars, cannot start with "." or "_".
// New packages (the generated project) must be lowercase; existing registry packages
// (custom deps) may still contain uppercase letters, e.g. "JSONStream".
const NEW_PACKAGE_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const EXISTING_PACKAGE_NAME = /^(?:@[a-zA-Z0-9-~][a-zA-Z0-9-._~]*\/)?[a-zA-Z0-9-~][a-zA-Z0-9-._~]*$/;
const MAX_NAME_LENGTH = 214;
const BLOCKED_NAMES = ['node_modules', 'favicon.ico'];
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

function isValidPackageName(name, { allowUppercase = false } = {}) {
    const pattern = allowUppercase ? EXISTING_PACKAGE_NAME : NEW_PACKAGE_NAME;
    return typeof name === 'string'
        && name.length <= MAX_NAME_LENGTH
        && pattern.test(name)
        && !BLOCKED_NAMES.includes(name.toLowerCase());
}

/**
 * Returns an error message when the project name cannot be used both as a folder
 * inside the current directory and as the generated package.json "name"; null otherwise.
 */
function validateProjectName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
        return 'O nome do projeto não pode ser vazio.';
    }
    if (/[\\/]/.test(name)) {
        return `Nome de projeto inválido: "${name}". Use apenas o nome da pasta, sem "/" ou "\\" (o projeto é criado no diretório atual).`;
    }
    if (WINDOWS_RESERVED.test(name)) {
        return `Nome de projeto inválido: "${name}" é um nome reservado do sistema.`;
    }
    if (!isValidPackageName(name)) {
        const suggestion = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-._~]+/g, '-')
            .replace(/^[._-]+/, '')
            .replace(/-+$/, '');
        const hint = suggestion && isValidPackageName(suggestion) ? ` Sugestão: "${suggestion}".` : '';
        return `Nome de projeto inválido: "${name}". Use letras minúsculas, números, "-", "." ou "_" (regras de nome de pacote npm).${hint}`;
    }
    return null;
}

/**
 * Parses user-supplied package specs into a { name: version } map.
 * Accepts a string or an array of strings (commander variadic options), each of which
 * may hold several specs separated by spaces or commas: "axios lodash@^4.17.21".
 * Throws if any spec does not contain a valid package name.
 */
function parsePackages(input) {
    if (!input) return {};
    const specs = (Array.isArray(input) ? input : [input])
        .flatMap((item) => String(item).split(/[\s,]+/))
        .filter(Boolean);

    const result = {};
    const invalid = [];
    for (const spec of specs) {
        // Skip index 0 so the "@" of a scoped name is not taken as the version separator.
        const versionAt = spec.indexOf('@', 1);
        const name = versionAt === -1 ? spec : spec.slice(0, versionAt);
        const version = versionAt === -1 ? '' : spec.slice(versionAt + 1);

        if (!isValidPackageName(name, { allowUppercase: true })) {
            invalid.push(spec);
            continue;
        }
        result[name] = version || 'latest';
    }

    if (invalid.length > 0) {
        throw new Error(`Pacote(s) inválido(s): ${invalid.map((s) => `"${s}"`).join(', ')}.`);
    }
    return result;
}

module.exports = { isValidPackageName, validateProjectName, parsePackages };
