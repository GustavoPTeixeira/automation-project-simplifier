function generateFrontendTest(language, framework) {
    const isTS = language === 'typescript';
    const ext = isTS ? 'ts' : 'js';
  
    if (framework === 'cypress') {
      return `
  // cypress/e2e/login-example.cy.${ext}
  import { LoginPage } from '../pages/LoginPage.${ext}';
  
  describe('Login', () => {
    const loginPage = new LoginPage();
  
    beforeEach(() => {
      loginPage.visit();
    });
  
    it('deve fazer login com sucesso', () => {
      loginPage.fillUsername('testuser');
      loginPage.fillPassword('password123');
      loginPage.submit();
      
      cy.url().should('include', '/dashboard');
    });
  });
  `;
    }
  
    if (framework === 'playwright') {
      return `
  // tests/login-example.spec.${ext}
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage.${ext}';
  
  test.describe('Login', () => {
    
    test('deve fazer login com sucesso', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.visit();
      await loginPage.fillUsername('testuser');
      await loginPage.fillPassword('password123');
      await loginPage.submit();
  
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });
  `;
    }
    return '// Framework não suportado';
  }
  
  module.exports = { generateFrontendTest };