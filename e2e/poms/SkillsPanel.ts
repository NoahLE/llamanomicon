import type { Page } from "@playwright/test";

import { AppFormModal } from "./AppFormModal";
import { ConfirmModal } from "./ConfirmModal";

export class SkillsPanel {
  private root;

  constructor(private page: Page) {
    this.root = page.locator('[data-tour-target="skills"]');
  }

  getSkill(name: string | RegExp) {
    return this.page.getByRole("option", { name });
  }

  async clickSkill(name: string | RegExp) {
    await this.getSkill(name).click();
  }

  async openAddDialog(): Promise<AppFormModal> {
    await this.root.getByRole("button").first().click();
    return new AppFormModal(this.page);
  }

  async addSkill(name: string) {
    const modal = await this.openAddDialog();
    await modal.fillField("Name", name);
    await modal.save();
  }

  async openEditModal(name: string | RegExp): Promise<AppFormModal> {
    await this.clickSkill(name);
    await this.getSkill(name).getByRole("button").first().click();
    return new AppFormModal(this.page);
  }

  async editSkill(name: string | RegExp, newName: string) {
    const modal = await this.openEditModal(name);
    await modal.fillField("Name", newName);
    await modal.save();
  }

  async deleteSkill(name: string | RegExp) {
    const modal = await this.openEditModal(name);
    await modal.clickDelete();
    await new ConfirmModal(this.page).confirm();
  }

  async activateAll(skillName: string | RegExp) {
    await this.getSkill(skillName)
      .getByRole("button", { name: /Activate all snippets/i })
      .first()
      .click();
  }

  async deactivateAll(skillName: string | RegExp) {
    await this.getSkill(skillName)
      .getByRole("button", { name: /Deactivate all snippets/i })
      .first()
      .click();
  }

  getCountText(skillName: string | RegExp) {
    return this.getSkill(skillName).locator(".text-xs");
  }
}
