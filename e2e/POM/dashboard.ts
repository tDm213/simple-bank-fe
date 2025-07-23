import { Locator, Page } from '@playwright/test'

export class Dashboard {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  LogoutBtn = (): Locator => this.page.locator('#logout-btn')
  History = (): Locator => this.page.locator('#history')
  ApproveButton = (): Locator => this.page.locator('#approveBtn')
  RejectButton = (): Locator => this.page.locator('#rejectBtn')

  async sendAmount(to: string, amount: string) {
    await this.page.click('[id="tabSend"]')
    await this.page.fill('[id="sendTo"]', to)
    await this.page.fill('[id="sendAmount"]', amount)

    const [response] = await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/transaction/send')),
      this.page.click('[id="SendAmountButton"]'),
    ])
    return response
  }

  async requestAmount(from: string, amount: string) {
    await this.page.click('[id="tabRequest"]')
    await this.page.fill('[id="requestFrom"]', from)
    await this.page.fill('[id="requestAmount"]', amount)

    const [response] = await Promise.all([
      this.page.waitForResponse(resp => resp.url().includes('/transaction/request')),
      this.page.click('[id="RequestAmountButton"]'),
    ])
    return response
  }
}