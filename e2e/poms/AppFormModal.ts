import type { Page } from "@playwright/test";

export class AppFormModal {
  readonly modal;

  constructor(private page: Page) {
    this.modal = page.getByRole("dialog");
  }

  async fillField(label: string, value: string) {
    await this.modal.getByLabel(label).fill(value);
  }

  async save() {
    await this.modal.getByRole("button", { name: "Save", exact: true }).click();
  }

  async clickDelete() {
    await this.modal.getByRole("button", { name: "Delete" }).click();
  }
}
