import type { Page } from "@playwright/test";

export class ConfirmModal {
  constructor(private page: Page) {}

  async confirm(scope = "Confirm Delete", buttonLabel = "Delete") {
    await this.page
      .getByLabel(scope)
      .getByRole("button", { name: buttonLabel })
      .click();
  }

  async cancel(scope = "Confirm Delete") {
    await this.page
      .getByLabel(scope)
      .getByRole("button", { name: "Cancel" })
      .click();
  }
}
