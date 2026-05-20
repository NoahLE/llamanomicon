import type { Page } from "@playwright/test";

import { buildSeededStorage } from "../fixtures";
import { AgentsPanel } from "./AgentsPanel";
import { DocsModal } from "./DocsModal";
import { NavSidebarPanel } from "./NavSidebar";
import { OutputStructurePanel } from "./OutputStructurePanel";
import { RawOutputPanel } from "./RawOutputPanel";
import { SessionControls } from "./SessionControls";
import { SkillsPanel } from "./SkillsPanel";
import { SnippetsPanel } from "./SnippetsPanel";
import { WelcomeModal } from "./WelcomeModal";

export class AppPage {
  constructor(readonly page: Page) {}

  async seedAndGo() {
    await this.page.goto("/");
    await this.page.evaluate(
      (s) => localStorage.setItem("llamanomicon-v2", s),
      buildSeededStorage(),
    );
    await this.page.reload();
    await this.page
      .getByRole("heading", { name: "Agents" })
      .waitFor({ timeout: 15_000 });
  }

  get agents() {
    return new AgentsPanel(this.page);
  }

  get skills() {
    return new SkillsPanel(this.page);
  }

  get snippets() {
    return new SnippetsPanel(this.page);
  }

  get outputStructure() {
    return new OutputStructurePanel(this.page);
  }

  get rawOutput() {
    return new RawOutputPanel(this.page);
  }

  get sessionControls() {
    return new SessionControls(this.page);
  }

  get navSidebar() {
    return new NavSidebarPanel(this.page);
  }

  get docsModal() {
    return new DocsModal(this.page);
  }

  get welcomeModal() {
    return new WelcomeModal(this.page);
  }
}
