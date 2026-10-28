function generateCiWorkflow(ciProvider, framework) {
  const provider = (ciProvider || 'github').toLowerCase();

  // 1. GitHub Actions
  if (provider === 'github') {
    let content = '';
    if (framework === 'playwright') {
      content = `name: End-to-End Tests

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
    } else if (framework === 'cypress') {
      content = `name: End-to-End Tests

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
    } else if (framework === 'webdriverio') {
      content = `name: End-to-End Tests

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
    return { filePath: '.github/workflows/e2e.yml', content };
  }

  // 2. GitLab CI/CD
  if (provider === 'gitlab') {
    let scriptExtra = '';
    let artifactPath = '';

    if (framework === 'playwright') {
      scriptExtra = '    - npx playwright install --with-deps\n';
      artifactPath = '      - playwright-report/\n';
    } else if (framework === 'cypress') {
      artifactPath = '      - cypress/screenshots/\n      - cypress/videos/\n';
    }

    const content = `stages:
  - test

e2e_tests:
  stage: test
  image: node:20
  before_script:
    - npm ci
${scriptExtra}  script:
    - npm test
${artifactPath ? `  artifacts:
    when: always
    paths:
${artifactPath}    expire_in: 1 week
` : ''}`;

    return { filePath: '.gitlab-ci.yml', content };
  }

  // 3. Azure DevOps Pipelines
  if (provider === 'azure') {
    let browserInstallStep = '';
    if (framework === 'playwright') {
      browserInstallStep = `- script: npx playwright install --with-deps
  displayName: 'Install Playwright Browsers'

`;
    }

    const content = `trigger:
  - main
  - master

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'Install Dependencies'

${browserInstallStep}- script: npm test
  displayName: 'Run Tests'
`;

    return { filePath: 'azure-pipelines.yml', content };
  }

  // 4. Bitbucket Pipelines
  if (provider === 'bitbucket') {
    let browserInstallStep = '';
    let artifactsBlock = '';

    if (framework === 'playwright') {
      browserInstallStep = '          - npx playwright install --with-deps\n';
      artifactsBlock = '        artifacts:\n          - playwright-report/**\n';
    } else if (framework === 'cypress') {
      artifactsBlock = '        artifacts:\n          - cypress/screenshots/**\n          - cypress/videos/**\n';
    }

    const content = `image: node:20

pipelines:
  default:
    - step:
        name: Run E2E Tests
        caches:
          - node
        script:
          - npm ci
${browserInstallStep}          - npm test
${artifactsBlock}`;

    return { filePath: 'bitbucket-pipelines.yml', content };
  }

  // 5. Jenkins
  if (provider === 'jenkins') {
    let browserStage = '';
    let archiveBlock = '';

    if (framework === 'playwright') {
      browserStage = `        stage('Install Browsers') {
            steps {
                sh 'npx playwright install --with-deps'
            }
        }
`;
      archiveBlock = `    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
`;
    } else if (framework === 'cypress') {
      archiveBlock = `    post {
        always {
            archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
        }
    }
`;
    }

    const content = `pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
${browserStage}        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
${archiveBlock}}
`;

    return { filePath: 'Jenkinsfile', content };
  }

  return { filePath: '', content: '' };
}

module.exports = { generateCiWorkflow };
