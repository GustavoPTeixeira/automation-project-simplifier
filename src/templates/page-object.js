function generatePageObject(language, framework) {
    const isTS = language === 'typescript';
  
    if (framework === 'cypress') {
      return `
  // cypress/pages/LoginPage.${isTS ? 'ts' : 'js'}
  ${isTS ? `
  export class LoginPage {
    visit(): void {
      cy.visit('/login');
    }
  
    fillUsername(username: string): void {
      cy.get('[data-cy="username"]').type(username);
    }
  
    fillPassword(password: string): void {
      cy.get('[data-cy="password"]').type(password);
    }
  
    submit(): void {
      cy.get('[data-cy="login-button"]').click();
    }
  }
  ` : `
  export class LoginPage {
    visit() {
      cy.visit('/login');
    }
  
    fillUsername(username) {
      cy.get('[data-cy="username"]').type(username);
    }
  
    fillPassword(password) {
      cy.get('[data-cy="password"]').type(password);
    }
  
    submit() {
      cy.get('[data-cy="login-button"]').click();
    }
  }
  `}
  `;
    }
  
    if (framework === 'playwright') {
      return `
  // pages/LoginPage.${isTS ? 'ts' : 'js'}
  ${isTS ? `
  import { type Page, type Locator, expect } from '@playwright/test';
  
  export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
  
    constructor(page: Page) {
      this.page = page;
      this.usernameInput = page.locator('[data-cy="username"]');
      this.passwordInput = page.locator('[data-cy="password"]');
      this.loginButton = page.locator('[data-cy="login-button"]');
    }
  
    async visit(): Promise<void> {
      await this.page.goto('/login');
    }
  
    async fillUsername(username: string): Promise<void> {
      await this.usernameInput.fill(username);
    }
  
    async fillPassword(password: string): Promise<void> {
      await this.passwordInput.fill(password);
    }
  
    async submit(): Promise<void> {
      await this.loginButton.click();
    }
  }
  ` : `
  export class LoginPage {
    constructor(page) {
      this.page = page;
      this.usernameInput = page.locator('[data-cy="username"]');
      this.passwordInput = page.locator('[data-cy="password"]');
      this.loginButton = page.locator('[data-cy="login-button"]');
    }
  
    async visit() {
      await this.page.goto('/login');
    }
  
    async fillUsername(username) {
      await this.usernameInput.fill(username);
    }
  
    async fillPassword(password) {
      await this.passwordInput.fill(password);
    }
  
    async submit() {
      await this.loginButton.click();
    }
  }
  `}
  `;
    }
  
    return '// Framework não suportado';
}

module.exports = { generatePageObject };