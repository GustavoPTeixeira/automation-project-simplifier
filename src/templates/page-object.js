function generatePageObject(language, framework) {
  const isTS = language === 'typescript';
  if (framework === 'cypress') {
    return `
// cypress/pages/LoginPage.${isTS ? 'ts' : 'js'}
import { BasePage } from './BasePage';
${isTS ? `
export class LoginPage extends BasePage {
  visit(): void {
    this.navigate('/login');
  }
  fillUsername(username: string): void {
    this.getElement('[data-cy="username"]').type(username);
  }
  fillPassword(password: string): void {
    this.getElement('[data-cy="password"]').type(password);
  }
  submit(): void {
    this.getElement('[data-cy="login-button"]').click();
  }
  login(username: string, password: string): void {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
  }
}
` : `
export class LoginPage extends BasePage {
  visit() {
    this.navigate('/login');
  }
  fillUsername(username) {
    this.getElement('[data-cy="username"]').type(username);
  }
  fillPassword(password) {
    this.getElement('[data-cy="password"]').type(password);
  }
  submit() {
    this.getElement('[data-cy="login-button"]').click();
  }
  login(username, password) {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
  }
}
`}
`;
  }
  if (framework === 'playwright') {
    return `
// pages/LoginPage.${isTS ? 'ts' : 'js'}
import { BasePage } from './BasePage';
${isTS ? `
import { type Page, type Locator } from '@playwright/test';
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  constructor(page: Page) {
    super(page);
    this.usernameInput = this.locator('[data-cy="username"]');
    this.passwordInput = this.locator('[data-cy="password"]');
    this.loginButton = this.locator('[data-cy="login-button"]');
  }
  async visit(): Promise<void> {
    await this.navigate('/login');
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
  async login(username: string, password: string): Promise<void> {
    await this.visit();
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }
}
` : `
export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = this.locator('[data-cy="username"]');
    this.passwordInput = this.locator('[data-cy="password"]');
    this.loginButton = this.locator('[data-cy="login-button"]');
  }
  async visit() {
    await this.navigate('/login');
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
  async login(username, password) {
    await this.visit();
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }
}
`}
`;
  }
  if (framework === 'webdriverio') {
    return `
// pages/LoginPage.${isTS ? 'ts' : 'js'}
import { BasePage } from './BasePage';
${isTS ? `
export class LoginPage extends BasePage {
  get usernameInput() {
    return $('[data-cy="username"]');
  }
  get passwordInput() {
    return $('[data-cy="password"]');
  }
  get loginButton() {
    return $('[data-cy="login-button"]');
  }
  async visit(): Promise<void> {
    await this.navigate('/login');
  }
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.setValue(username);
  }
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.setValue(password);
  }
  async submit(): Promise<void> {
    await this.loginButton.click();
  }
  async login(username: string, password: string): Promise<void> {
    await this.visit();
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }
}
` : `
export class LoginPage extends BasePage {
  get usernameInput() {
    return $('[data-cy="username"]');
  }
  get passwordInput() {
    return $('[data-cy="password"]');
  }
  get loginButton() {
    return $('[data-cy="login-button"]');
  }
  async visit() {
    await this.navigate('/login');
  }
  async fillUsername(username) {
    await this.usernameInput.setValue(username);
  }
  async fillPassword(password) {
    await this.passwordInput.setValue(password);
  }
  async submit() {
    await this.loginButton.click();
  }
  async login(username, password) {
    await this.visit();
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }
}
`}
`;
  }
  return '// Framework não suportado';
}
module.exports = { generatePageObject };