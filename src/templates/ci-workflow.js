function generateCiWorkflow(framework) {
    if(framework === 'playwright'){
        return `name: End-to-End Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm test
    - uses: actions/upload-artifact@v4
      if: \${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
`;
    }

    if(framework === "cypress"){
        return `name: End-to-End Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run Cypress tests
      run: npm test
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: cypress-artifacts
        path: |
          cypress/screenshots
          cypress/videos
        retention-days: 14
`; 
    }

    if(framework === "webdriverio"){
        return `name: End-to-End Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run WebdriverIO tests
      run: npm test
`;
    }

    return '# Framework não suportado';
}

module.exports = { generateCiWorkflow };
