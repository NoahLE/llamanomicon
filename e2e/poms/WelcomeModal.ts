import type { Page } from "@playwright/test";

export class WelcomeModal {
  constructor(private page: Page) {}

  get heading() {
    return this.page.getByRole("heading", { name: "Welcome to Llamanomicon" });
  }

  async clickNewFile() {
    await this.page.getByText("New File").click();
  }

  async clickStartTour() {
    await this.page
      .getByRole("button", { name: "Start onboarding tour" })
      .click();
  }
}
