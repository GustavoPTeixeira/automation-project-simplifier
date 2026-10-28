function generateBaseService(language, framework) {
  const isTS = language === 'typescript';

  if (framework === 'cypress') {
    return `
// cypress/services/BaseService.${isTS ? 'ts' : 'js'}
${isTS ? `
export abstract class BaseService {
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = Cypress.env('API_URL') || 'http://localhost:3000/api';
  }

  protected get(endpoint: string, options: Partial<Cypress.RequestOptions> = {}): Cypress.Chainable<Cypress.Response<any>> {
    return cy.request({
      method: 'GET',
      url: \`\${this.baseUrl}\${endpoint}\`,
      ...options,
    });
  }

  protected post(endpoint: string, body?: any, options: Partial<Cypress.RequestOptions> = {}): Cypress.Chainable<Cypress.Response<any>> {
    return cy.request({
      method: 'POST',
      url: \`\${this.baseUrl}\${endpoint}\`,
      body,
      ...options,
    });
  }
}
` : `
export class BaseService {
  constructor() {
    this.baseUrl = Cypress.env('API_URL') || 'http://localhost:3000/api';
  }

  get(endpoint, options = {}) {
    return cy.request({
      method: 'GET',
      url: \`\${this.baseUrl}\${endpoint}\`,
      ...options,
    });
  }

  post(endpoint, body, options = {}) {
    return cy.request({
      method: 'POST',
      url: \`\${this.baseUrl}\${endpoint}\`,
      body,
      ...options,
    });
  }
}
`}
`;
  }

  if (framework === 'playwright') {
    return `
// services/BaseService.${isTS ? 'ts' : 'js'}
${isTS ? `
import { type APIRequestContext, type APIResponse } from '@playwright/test';

export abstract class BaseService {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  protected async get(endpoint: string, options = {}): Promise<APIResponse> {
    return this.request.get(\`\${this.baseUrl}\${endpoint}\`, options);
  }

  protected async post(endpoint: string, data?: any, options = {}): Promise<APIResponse> {
    return this.request.post(\`\${this.baseUrl}\${endpoint}\`, {
      data,
      ...options,
    });
  }
}
` : `
export class BaseService {
  constructor(request) {
    this.request = request;
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  async get(endpoint, options = {}) {
    return this.request.get(\`\${this.baseUrl}\${endpoint}\`, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request.post(\`\${this.baseUrl}\${endpoint}\`, {
      data,
      ...options,
    });
  }
}
`}
`;
  }

  if (framework === 'webdriverio') {
    return `
// services/BaseService.${isTS ? 'ts' : 'js'}
${isTS ? `
export abstract class BaseService {
  protected readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  protected async get(endpoint: string, headers: HeadersInit = {}): Promise<Response> {
    return fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }

  protected async post(endpoint: string, data?: any, headers: HeadersInit = {}): Promise<Response> {
    return fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}
` : `
export class BaseService {
  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  async get(endpoint, headers = {}) {
    return fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }

  async post(endpoint, data, headers = {}) {
    return fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}
`}
`;
  }

  return '// Framework não suportado';
}

module.exports = { generateBaseService };

