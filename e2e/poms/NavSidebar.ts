import type { Page } from "@playwright/test";

export class NavSidebarPanel {
  constructor(private page: Page) {}

  async open() {
    await this.page.getByRole("button", { name: "Settings" }).click();
    await this.page.getByRole("heading", { name: "Settings" }).waitFor();
  }

  async close() {
    await this.page.getByRole("button", { name: "Close" }).first().click();
  }
}
