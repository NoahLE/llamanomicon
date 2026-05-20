import type { Page } from "@playwright/test";

export class OutputStructurePanel {
  constructor(private page: Page) {}

  get heading() {
    return this.page.getByRole("heading", { name: "Structure" });
  }

  getSkillSection(skillName: string) {
    return this.page.getByRole("button", { name: skillName });
  }

  getSnippetInSection(skillName: string, snippetName: string) {
    return this.page.getByLabel(skillName).getByText(snippetName);
  }
}
