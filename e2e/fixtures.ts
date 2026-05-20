/**
 * Shared Playwright fixtures and helpers for Llamanomicon e2e tests.
 *
 * The app shows a WelcomeModal when localStorage["llamanomicon-v2"] is absent.
 * The Zustand persist middleware stores { state: { baseline, outputSettings }, version: 0 }
 * under that key, with Maps and Sets encoded via the custom replacer in serialization.ts:
 *   Map  → { __type: "Map",  entries: [[k,v],...] }
 *   Set  → { __type: "Set",  values:  [v,...] }
 *
 * We must mirror this encoding or Zustand's reviver will leave baseline as a
 * plain object and the WelcomeModal will still appear (agents.size === 0).
 */

import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { AppPage } from "./poms/AppPage";

/** Encode a value using the same replacer logic as src/lib/serialization.ts. */
function encodeValue(v: unknown): unknown {
  if (v instanceof Map) {
    return {
      __type: "Map",
      entries: [...v.entries()].map(([k, val]) => [k, encodeValue(val)]),
    };
  }
  if (v instanceof Set) {
    return { __type: "Set", values: [...v].map(encodeValue) };
  }
  if (Array.isArray(v)) {
    return v.map(encodeValue);
  }
  if (v !== null && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = encodeValue(val);
    }
    return out;
  }
  return v;
}

/** Agent entity stored in the baseline Map. */
interface AgentEntry {
  id: string;
  name: string;
  activeSet: Set<string>;
}

/** Snippet entity stored in the baseline Map. */
interface SnippetEntry {
  id: string;
  name: string;
  text: string;
  skills: Set<string>;
}

/** Skill entity stored in the baseline Map. */
interface SkillEntry {
  id: string;
  name: string;
}

/**
 * Build the value that Zustand persist would write to localStorage.
 * Uses the same Map/Set encoding as src/lib/serialization.ts.
 */
export function buildSeededStorage(): string {
  const snippets: Map<string, SnippetEntry> = new Map([
    [
      "snip-1",
      {
        id: "snip-1",
        name: "Alpha Snippet",
        text: "Alpha snippet content.",
        skills: new Set(["skill-coding"]),
      },
    ],
    [
      "snip-2",
      {
        id: "snip-2",
        name: "Beta Snippet",
        text: "Beta snippet content.",
        skills: new Set(["skill-coding"]),
      },
    ],
    [
      "snip-3",
      {
        id: "snip-3",
        name: "Gamma Snippet",
        text: "Gamma snippet content.",
        skills: new Set<string>(),
      },
    ],
  ]);

  const skills: Map<string, SkillEntry> = new Map([
    ["skill-coding", { id: "skill-coding", name: "Coding" }],
    ["skill-tone", { id: "skill-tone", name: "Tone" }],
  ]);

  const agents: Map<string, AgentEntry> = new Map([
    [
      "agent-1",
      {
        id: "agent-1",
        name: "Agent One",
        activeSet: new Set(["snip-1"]),
      },
    ],
    [
      "agent-2",
      {
        id: "agent-2",
        name: "Agent Two",
        activeSet: new Set<string>(),
      },
    ],
  ]);

  const baseline = { snippets, skills, agents };
  const outputSettings = { theme: "light" };

  const persistValue = encodeValue({
    state: { baseline, outputSettings },
    version: 0,
  });
  return JSON.stringify(persistValue);
}

/** Seed localStorage and navigate; returns after the page is interactive. */
async function seedAndGo(page: Page): Promise<void> {
  // Navigate first so we have a window context to write localStorage into,
  // then inject state and reload so Zustand hydrates from it.
  await page.goto("/");
  await page.evaluate((serialized) => {
    localStorage.setItem("llamanomicon-v2", serialized);
  }, buildSeededStorage());
  await page.reload();
  // Wait for the main UI — if localStorage was invalid the WelcomeModal shows instead
  await page
    .getByRole("heading", { name: "Agents" })
    .waitFor({ timeout: 15_000 });
}

/** Extended test fixture that seeds localStorage and exposes an AppPage. */
export const test = base.extend<{ app: AppPage }>({
  app: async ({ page }, use) => {
    const app = new AppPage(page);
    await app.seedAndGo();
    await use(app);
  },
});

export { expect };
