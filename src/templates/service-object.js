function generateServiceObject(language, framework) {
    const isTS = language === 'typescript';
  
    if (framework === 'cypress') {
      // Cypress usa 'cy.request'
      return `
  // cypress/services/UserService.${isTS ? 'ts' : 'js'}
  ${isTS ? `
  export class UserService {
    getUsers() {
      return cy.request({
        method: 'GET',
        url: \`\${Cypress.env('API_URL')}/users\`,
      });
    }
  
    createUser(user: any) {
      return cy.request({
        method: 'POST',
        url: \`\${Cypress.env('API_URL')}/users\`,
        body: user,
      });
    }
  }
  ` : `
  export class UserService {
    getUsers() {
      return cy.request({
        method: 'GET',
        url: \`\${Cypress.env('API_URL')}/users\`,
      });
    }
  
    createUser(user) {
      return cy.request({
        method: 'POST',
        url: \`\${Cypress.env('API_URL')}/users\`,
        body: user,
      });
    }
  }
  `}
  `;
    }
  
    if (framework === 'playwright') {
      // Playwright usa APIRequestContext
      return `
  // services/UserService.${isTS ? 'ts' : 'js'}
  ${isTS ? `
  import { type APIRequestContext, type APIResponse } from '@playwright/test';
  
  export class UserService {
    readonly request: APIRequestContext;
    readonly baseUrl: string;
  
    constructor(request: APIRequestContext) {
      this.request = request;
      this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
    }
  
    async getUsers(): Promise<APIResponse> {
      return this.request.get(\`\${this.baseUrl}/users\`);
    }
  
    async createUser(user: any): Promise<APIResponse> {
      return this.request.post(\`\${this.baseUrl}/users\`, {
        data: user,
      });
    }
  }
  ` : `
  export class UserService {
    constructor(request) {
      this.request = request;
      this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
    }
  
    async getUsers() {
      return this.request.get(\`\${this.baseUrl}/users\`);
    }
  
    async createUser(user) {
      return this.request.post(\`\${this.baseUrl}/users\`, {
        data: user,
      });
    }
  }
  `}
  `;
    }
    return '// Framework não suportado';
  }
  
  module.exports = { generateServiceObject };