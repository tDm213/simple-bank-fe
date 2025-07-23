// support/POM/auth.ts
import { Page, Locator } from '@playwright/test'

export class AuthPage {
  constructor(private page: Page) {}

  //#region Signup
  tabSignup = (): Locator => this.page.locator('#tabSignup')
  signupUsername = (): Locator => this.page.locator('#signupUsername')
  signupPassword = (): Locator => this.page.locator('#signupPassword')
  signupButton = (): Locator => this.page.locator('#signupButton')
  signupPassError = (): Locator => this.page.locator('#signupPassError')
  //#endregion Signup

  logoutBtn = (): Locator => this.page.locator('#logout-btn')

  loginBtn = (): Locator => this.page.locator('#loginButton')

  loginPassError = (): Locator => this.page.locator('#loginPassError')

  login = async (username: string, password: string): Promise<void> => {
    await this.page.locator('#loginUsername').fill(username)
    await this.page.locator('#loginPassword').fill(password)
    await this.loginBtn().click()
  }
}
