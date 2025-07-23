import { test, expect } from '@playwright/test'
import { users } from '../e2e/fixtures/users'
import { AuthPage } from '../e2e/POM/auth'
import { Dashboard } from '../e2e/POM/dashboard'

const sendAmount = '5'
const requestAmount = '1'
const userValid = users.userValid.username

test.describe('User Making Transactions', () => {
    let auth: AuthPage
    let dashboard: Dashboard
    const password = process.env.PASSWORD || 'defaultPassword'

    const loginAndGotoDashboard = async (page: any, user: any) => {
        auth = new AuthPage(page)
        dashboard = new Dashboard(page)

        await page.goto('/')
        await auth.login(user.username, password)
        await expect(page).toHaveURL("/dashboard.html")
        await expect(dashboard.LogoutBtn()).toBeVisible()
    }

    test.describe('Functional tests', () => {
        test('Send money to existing user', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)
            await dashboard.sendAmount(userValid, sendAmount)
            await expect(dashboard.History()).toContainText(`✔ Sent $${sendAmount} to ${userValid}`)
        })

        test('Request money from existing user', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)
            await dashboard.requestAmount(userValid, requestAmount)
            await expect(dashboard.History()).toContainText(`⏳ Requested $${requestAmount} from ${userValid}`)
        })

        test.describe('Approve money request', () => {
            test.beforeEach(async ({ page }) => {
                await loginAndGotoDashboard(page, users.JohnDoe)
                await dashboard.requestAmount(userValid, requestAmount)
                await expect(dashboard.History()).toContainText(`⏳ Requested $${requestAmount} from ${userValid}`)
            })

            test('Approve money request', async ({ page }) => {
                await loginAndGotoDashboard(page, users.userValid)

                const [response] = await Promise.all([
                    page.waitForResponse(res => res.url().includes('/transaction/request/approve') && res.status() === 200),
                    dashboard.ApproveButton().first().click()
                ])

                expect(response.status()).toBe(200)

                const body = await response.json()
                console.log('Approve request response body:', body)  // Debug log

                expect(body).toHaveProperty('message')
                expect(body.message).toBe('Request approved and money transferred')

                await expect(dashboard.History()).toContainText(`✔ Requested $${requestAmount} from ${userValid}`)
            })
        })

        test.describe('Reject money request', () => {
            test.beforeEach(async ({ page }) => {
                await loginAndGotoDashboard(page, users.JohnDoe)
                await dashboard.requestAmount(userValid, requestAmount)
                await expect(dashboard.History()).toContainText(`⏳ Requested $${requestAmount} from ${userValid}`)
            })

            test('Reject money request', async ({ page }) => {
                await loginAndGotoDashboard(page, users.userValid)

                const [response] = await Promise.all([
                    page.waitForResponse(res => res.url().includes('/transaction/request/reject') && res.status() === 200),
                    dashboard.RejectButton().first().click()
                ])

                expect(response.status()).toBe(200)

                const body = await response.json()
                console.log('Reject request response body:', body)  // Debug log

                expect(body).toHaveProperty('message')
                expect(body.message).toBe('Request rejected')

                await expect(dashboard.History()).toContainText(`✘ Requested $${requestAmount} from ${userValid}`)
            })
        })

    })

    test.describe('Non-Functional Tests', () => {
        test('Send with invalid fields', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)

            const [response] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/transaction/send') && res.status() === 400),
                dashboard.sendAmount('Invalid', '-1')
            ])

            const body = await response.json()
            expect(response.status()).toBe(400)
            expect(body).toEqual({ error: 'Invalid input' })
        })

        test('Request with invalid fields', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)

            const [response] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/transaction/request') && res.status() === 400),
                dashboard.requestAmount('Invalid', '-1')
            ])

            const body = await response.json()
            expect(response.status()).toBe(400)
            expect(body).toEqual({ error: 'Invalid input' })
        })

        test('Attempt request with non-existing user', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)

            const [response] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/transaction/request') && res.status() === 404),
                dashboard.requestAmount('Invalid', '1')
            ])

            const body = await response.json()
            expect(response.status()).toBe(404)
            expect(body).toEqual({ error: 'User not found' })
        })

        test('Attempt send to non-existing user', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)

            const [response] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/transaction/send') && res.status() === 404),
                dashboard.sendAmount('Invalid', '1')
            ])

            const body = await response.json()
            expect(response.status()).toBe(404)
            expect(body).toEqual({ error: 'Sender or recipient not found' })
        })

        test('Insufficient funds on send', async ({ page }) => {
            await loginAndGotoDashboard(page, users.JohnDoe)

            const [response] = await Promise.all([
                page.waitForResponse(res => res.url().includes('/transaction/send') && res.status() === 400),
                dashboard.sendAmount(userValid, '9999')
            ])

            const body = await response.json()
            expect(response.status()).toBe(400)
            expect(body).toEqual({ error: 'Insufficient balance' })
        })
    })
})
