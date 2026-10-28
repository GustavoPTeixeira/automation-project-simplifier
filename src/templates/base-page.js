function generateBasePage(language, framework) {
  const isTS = language === 'typescript';

  if (framework === 'cypress') {
    return `
// cypress/pages/BasePage.${isTS ? 'ts' : 'js'}
${isTS ? `
export abstract class BasePage {
  navigate(path: string = ''): void {
    cy.visit(path);
  }

  getElement(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector);
  }

  getUrl(): Cypress.Chainable<string> {
    return cy.url();
  }

  getTitle(): Cypress.Chainable<string> {
    return cy.title();
  }

  waitForElement(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector, { timeout: 10000 }).should('be.visible');
  }
}
` : `
export class BasePage {
  navigate(path = '') {
    cy.visit(path);
  }

  getElement(selector) {
    return cy.get(selector);
  }

  getUrl() {
    return cy.url();
  }

  getTitle() {
    return cy.title();
  }

  waitForElement(selector) {
    return cy.get(selector, { timeout: 10000 }).should('be.visible');
  }
}
`}
`;
  }

  if (framework === 'playwright') {
    return `
// pages/BasePage.${isTS ? 'ts' : 'js'}
${isTS ? `
import { type Page, type Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }
}
` : `
export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path);
  }

  async getTitle() {
    return this.page.title();
  }

  async getUrl() {
    return this.page.url();
  }

  locator(selector) {
    return this.page.locator(selector);
  }

  async waitForUrl(urlPattern) {
    await this.page.waitForURL(urlPattern);
  }
}
`}
`;
  }

  if (framework === 'webdriverio') {
    return `
// pages/BasePage.${isTS ? 'ts' : 'js'}
${isTS ? `
export abstract class BasePage {
  async navigate(path: string = ''): Promise<void> {
    await browser.url(path);
  }

  async getTitle(): Promise<string> {
    return browser.getTitle();
  }

  async getUrl(): Promise<string> {
    return browser.getUrl();
  }

  async waitForDisplayed(selector: string, timeout: number = 10000): Promise<void> {
    const el = await $(selector);
    await el.waitForDisplayed({ timeout });
  }
}
` : `
export class BasePage {
  async navigate(path = '') {
    await browser.url(path);
  }

  async getTitle() {
    return browser.getTitle();
  }

  async getUrl() {
    return browser.getUrl();
  }

  async waitForDisplayed(selector, timeout = 10000) {
    const el = await $(selector);
    await el.waitForDisplayed({ timeout });
  }
}
`}
`;
  }

  return '// Framework não suportado';
}

module.exports = { generateBasePage };