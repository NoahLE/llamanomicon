import type { Page } from "@playwright/test";

export class RawOutputPanel {
  private root;

  constructor(private page: Page) {
    this.root = page.locator('[data-tour-target="raw-output"]');
  }

  get pre() {
    return this.root.locator("pre");
  }

  get emptyState() {
    return this.root.getByText("No prompt yet");
  }

  get copyButton() {
    return this.root.getByRole("button").last();
  }

  async clickXml() {
    await this.root.getByRole("button", { name: "XML" }).click();
  }

  async clickText() {
    await this.root.getByRole("button", { name: "Text" }).click();
  }
}
