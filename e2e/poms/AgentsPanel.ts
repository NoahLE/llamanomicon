import type { Page } from "@playwright/test";

import { AppFormModal } from "./AppFormModal";
import { ConfirmModal } from "./ConfirmModal";

export class AgentsPanel {
  private root;

  constructor(private page: Page) {
    this.root = page.locator('[data-tour-target="agents"]');
  }

  getAgent(name: string | RegExp) {
    return this.page.getByRole("option", { name });
  }

  async clickAgent(name: string | RegExp) {
    await this.getAgent(name).click();
  }

  async openAddDialog(): Promise<AppFormModal> {
    await this.root.getByRole("button").first().click();
    return new AppFormModal(this.page);
  }

  async addAgent(name: string) {
    const modal = await this.openAddDialog();
    await modal.fillField("Name", name);
    await modal.save();
  }

  async openEditModal(name: string | RegExp): Promise<AppFormModal> {
    await this.clickAgent(name);
    await this.getAgent(name).getByRole("button").click();
    return new AppFormModal(this.page);
  }

  async editAgent(name: string | RegExp, newName: string) {
    const modal = await this.openEditModal(name);
    await modal.fillField("Name", newName);
    await modal.save();
  }

  async deleteAgent(name: string | RegExp) {
    const modal = await this.openEditModal(name);
    await modal.clickDelete();
    await new ConfirmModal(this.page).confirm();
  }
}
