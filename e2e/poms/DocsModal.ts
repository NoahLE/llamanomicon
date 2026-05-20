import type { Page } from "@playwright/test";

export class DocsModal {
  constructor(private page: Page) {}

  get openButton() {
    return this.page.getByRole("button", { name: "Open documentation" });
  }

  async open() {
    await this.page.getByRole("button", { name: "Settings" }).click();
    await this.openButton.waitFor({ state: "visible" });
    await this.openButton.click();
    await this.page.getByRole("heading", { name: "Documentation" }).waitFor();
  }

  get modal() {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByRole("heading", { name: "Documentation" }),
    });
  }

  getTab(name: string | RegExp) {
    return this.modal.getByRole("tab", { name });
  }

  async clickTab(name: string | RegExp) {
    await this.getTab(name).click();
  }

  async close() {
    await this.page.keyboard.press("Escape");
    await this.page
      .getByRole("heading", { name: "Documentation" })
      .waitFor({ state: "hidden" });
  }
}
