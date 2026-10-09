function generateBackendTest(language, framework) {
    const isTS = language === 'typescript';
    const ext = isTS ? 'ts' : 'js';
  
    if (framework === 'cypress') {
      return `
  // cypress/e2e/api/users.cy.${ext}
  import { UserService } from '../../services/UserService';
  
  describe('API - Usuários', () => {
    const userService = new UserService();
  
    it('deve buscar lista de usuários', () => {
      userService.getUsers().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  
    it('deve criar um novo usuário', () => {
      const newUser = { name: 'Nero', job: 'QA' };
      userService.createUser(newUser).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('name', newUser.name);
      });
    });
  });
  `;
    }
  
    if (framework === 'playwright') {
      return `
  // tests/api/users.spec.${ext}
  import { test, expect } from '@playwright/test';
  import { UserService } from '../../services/UserService';
  
  test.describe.serial('API - Usuários', () => {
    let userService${isTS ? ': UserService' : ''};
  
    test.beforeAll(async ({ request }) => {
      userService = new UserService(request);
    });
  
    test('deve buscar lista de usuários', async () => {
      const response = await userService.getUsers();
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });
  
    test('deve criar um novo usuário', async () => {
      const newUser = { name: 'Nero', job: 'QA' };
      const response = await userService.createUser(newUser);
      
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('name', newUser.name);
    });
  });
  `;
    }
    return '// Framework não suportado';
  }
  
  module.exports = { generateBackendTest };