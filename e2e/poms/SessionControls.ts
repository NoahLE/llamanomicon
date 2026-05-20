import type { Page } from "@playwright/test";

export class SessionControls {
  constructor(private page: Page) {}

  get saveButton() {
    return this.page.getByRole("button", { name: "Save session" });
  }

  get resetButton() {
    return this.page.getByRole("button", { name: "Reset session" });
  }

  get newSessionButton() {
    return this.page.getByRole("button", { name: "Reset all data" });
  }

  async save() {
    await this.saveButton.click();
  }

  async reset() {
    await this.resetButton.click();
  }

  async openNewSession() {
    await this.newSessionButton.click();
  }
}
