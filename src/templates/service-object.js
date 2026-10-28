function generateServiceObject(language, framework) {
  const isTS = language === 'typescript';

  if (framework === 'cypress') {
    return `
// cypress/services/UserService.${isTS ? 'ts' : 'js'}
import { BaseService } from './BaseService';

${isTS ? `
export class UserService extends BaseService {
  getUsers(): Cypress.Chainable<Cypress.Response<any>> {
    return this.get('/users');
  }

  createUser(user: any): Cypress.Chainable<Cypress.Response<any>> {
    return this.post('/users', user);
  }
}
` : `
export class UserService extends BaseService {
  getUsers() {
    return this.get('/users');
  }

  createUser(user) {
    return this.post('/users', user);
  }
}
`}
`;
  }

  if (framework === 'playwright') {
    return `
// services/UserService.${isTS ? 'ts' : 'js'}
import { BaseService } from './BaseService';
${isTS ? `
import { type APIRequestContext, type APIResponse } from '@playwright/test';

export class UserService extends BaseService {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getUsers(): Promise<APIResponse> {
    return this.get('/users');
  }

  async createUser(user: any): Promise<APIResponse> {
    return this.post('/users', user);
  }
}
` : `
export class UserService extends BaseService {
  constructor(request) {
    super(request);
  }

  async getUsers() {
    return this.get('/users');
  }

  async createUser(user) {
    return this.post('/users', user);
  }
}
`}
`;
  }

  if (framework === 'webdriverio') {
    return `
// services/UserService.${isTS ? 'ts' : 'js'}
import { BaseService } from './BaseService';

${isTS ? `
export class UserService extends BaseService {
  async getUsers(): Promise<Response> {
    return this.get('/users');
  }

  async createUser(user: any): Promise<Response> {
    return this.post('/users', user);
  }
}
` : `
export class UserService extends BaseService {
  async getUsers() {
    return this.get('/users');
  }

  async createUser(user) {
    return this.post('/users', user);
  }
}
`}
`;
  }

  return '// Framework não suportado';
}

module.exports = { generateServiceObject };
