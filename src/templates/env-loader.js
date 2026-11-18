// Env-file selection shared by every framework config. The generated config must
// already have `fs` and `dotenv` in scope.
//
// TEST_ENV unset or "local" -> .env (optional: defaults apply when it is missing)
// TEST_ENV=<name>           -> .env.<name> (required: fail instead of silently
//                              running against another environment)
function generateEnvLoader() {
    return `const testEnv = process.env.TEST_ENV || 'local';
const envFile = testEnv === 'local' ? '.env' : \`.env.\${testEnv}\`;
if (testEnv !== 'local' && !fs.existsSync(envFile)) {
  throw new Error(
    \`TEST_ENV="\${testEnv}" but \${envFile} was not found. Create it with: cp \${envFile}.example \${envFile}\`
  );
}
dotenv.config({ path: envFile });
`;
}

module.exports = { generateEnvLoader };
