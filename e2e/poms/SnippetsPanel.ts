import type { Page } from "@playwright/test";

import { AppFormModal } from "./AppFormModal";
import { ConfirmModal } from "./ConfirmModal";

export class SnippetsPanel {
  private root;

  constructor(private page: Page) {
    this.root = page.locator('[data-tour-target="snippets"]');
  }

  getSnippet(name: string | RegExp) {
    return this.page.getByRole("option", { name });
  }

  async clickSnippet(name: string | RegExp) {
    await this.getSnippet(name).click();
  }

  async openAddDialog(): Promise<AppFormModal> {
    await this.root.getByRole("button").first().click();
    return new AppFormModal(this.page);
  }

  async addSnippet(name: string, text: string) {
    const modal = await this.openAddDialog();
    await modal.fillField("Name", name);
    await modal.fillField("Text", text);
    await modal.save();
  }

  async openEditModal(name: string | RegExp): Promise<AppFormModal> {
    await this.getSnippet(name).getByRole("button").click();
    return new AppFormModal(this.page);
  }

  async editSnippet(
    name: string | RegExp,
    updates: { name?: string; text?: string },
  ) {
    const modal = await this.openEditModal(name);
    if (updates.name !== undefined) await modal.fillField("Name", updates.name);
    if (updates.text !== undefined) await modal.fillField("Text", updates.text);
    await modal.save();
  }

  async deleteSnippet(name: string | RegExp) {
    const modal = await this.openEditModal(name);
    await modal.clickDelete();
    await new ConfirmModal(this.page).confirm();
  }

  async tagSnippet(snippetName: string | RegExp, skillName: string) {
    const modal = await this.openEditModal(snippetName);
    await modal.modal.getByRole("row", { name: skillName }).click();
    await modal.save();
  }
}
