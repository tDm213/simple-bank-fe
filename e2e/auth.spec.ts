import { test, expect } from '@playwright/test'
import { users } from '../e2e/fixtures/users'
import { AuthPage } from '../e2e/POM/auth'

test.describe('User Sign-up and Login', () => {
  let auth: AuthPage
  const uniqueUsername = `user_${Date.now()}`
  const password = process.env.PASSWORD || 'defaultPassword'

  test.beforeEach(async ({ page }) => {
    auth = new AuthPage(page)
    await page.goto('/')
  })

  test.describe('Login-Logout', () => {
    test('Login with correct credentials', async ({ page }) => {
      await auth.login(users.userValid.username, password)
      await expect(page).toHaveURL('/dashboard.html')
      await expect(auth.logoutBtn()).toBeVisible()
    })

    test('Login with wrong credentials', async ({ page }) => {
      await auth.login(users.userValid.username, 'wrong-password')
      await expect(auth.loginPassError()).toHaveText('Invalid credentials')
    })

    test('Login with empty fields', async ({ page }) => {
      await auth.loginBtn().click()
      await expect(auth.logoutBtn()).not.toBeVisible()
    })

    test('Logout from dashboard', async ({ page }) => {
      await auth.login(users.userValid.username, password)
      await expect(page).toHaveURL('/dashboard.html')
      await auth.logoutBtn().click()
      await expect(auth.loginBtn()).toBeVisible()
    })
  })

  test.describe('Sign-up', () => {
    test('Successfully sign up with unique username and valid password', async ({ page }) => {
      await auth.tabSignup().click()
      await auth.signupUsername().fill(uniqueUsername)
      await auth.signupPassword().fill(password)
      await auth.signupButton().click()
      await expect(page).toHaveURL('/dashboard.html')
      await expect(auth.logoutBtn()).toBeVisible()
    })

    test('Signup with missing username/password', async ({ page }) => {
      await auth.tabSignup().click()
      await auth.signupButton().click()
      await expect(auth.logoutBtn()).not.toBeVisible()
    })

    test('Signup with short password', async ({ page }) => {
      await auth.tabSignup().click()
      await auth.signupUsername().fill(uniqueUsername)
      await auth.signupPassword().fill('a')
      await auth.signupButton().click()
      await expect(auth.signupPassError()).toHaveText('Password must be at least 4 characters.')
    })

    test('Signup with existing username', async ({ page }) => {
      await auth.tabSignup().click()
      await auth.signupUsername().fill(users.userValid.username)
      await auth.signupPassword().fill(password)
      await auth.signupButton().click()
      await expect(auth.signupPassError()).toHaveText('Username taken')
    })
  })
})
