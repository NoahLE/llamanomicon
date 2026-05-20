import { test, expect } from "./fixtures";
import { WelcomeModal } from "./poms/WelcomeModal";

/**
 * Welcome modal tests.
 *
 * The WelcomeModal shows when localStorage["llamanomicon-v2"] is null at the
 * time React's useState initializer runs. However, the Zustand store has
 * module-level code that calls seedData() → persist writes the seeded state
 * back to localStorage BEFORE React renders. This means the modal will never
 * appear from a normal reload after clearing localStorage.
 *
 * To test the modal, we use addInitScript to intercept localStorage.setItem
 * so the persist write for "llamanomicon-v2" is blocked during the initial
 * module load, allowing React to see a null value and open the modal.
 */

/** addInitScript payload that blocks the initial Zustand persist write. */
const BLOCK_INITIAL_PERSIST = `
  (function () {
    const _setItem = Storage.prototype.setItem.bind(localStorage);
    let blocked = false;
    Storage.prototype.setItem = function (key, value) {
      if (key === "llamanomicon-v2" && !blocked) {
        // Allow only after the flag is reset by the test
        return;
      }
      _setItem(key, value);
    };
    // Expose a way for the test to re-enable persistence after React mounts
    window.__unblockPersist = function () {
      blocked = true; // now setItem passes through normally
    };
  })();
`;

test.describe("Welcome modal", () => {
  test("shown when localStorage is empty on first load", async ({ page }) => {
    // Arrange
    await page.addInitScript(BLOCK_INITIAL_PERSIST);
    await page.goto("/");
    await page.waitForTimeout(1500);

    const welcome = new WelcomeModal(page);

    // Assert
    await expect(welcome.heading).toBeVisible();

    await expect(page).toHaveScreenshot("welcome-modal-open.png", {
      maxDiffPixels: 100,
    });
  });

  test("New File option clears data and dismisses modal", async ({ page }) => {
    // Arrange
    await page.addInitScript(BLOCK_INITIAL_PERSIST);
    await page.goto("/");
    await page.waitForTimeout(1500);

    const welcome = new WelcomeModal(page);
    await expect(welcome.heading).toBeVisible();

    // Act
    await welcome.clickNewFile();

    // Assert
    await expect(welcome.heading).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();

    await expect(page).toHaveScreenshot("main-ui-empty-after-new-file.png", {
      maxDiffPixels: 100,
    });
  });

  test("tour button seeds data, dismisses modal, starts onboarding", async ({
    page,
  }) => {
    // Arrange
    await page.addInitScript(BLOCK_INITIAL_PERSIST);
    await page.goto("/");
    await page.waitForTimeout(1500);

    const welcome = new WelcomeModal(page);

    // Act
    await welcome.clickStartTour();

    // Assert — scope to dialog role to avoid matching intro.js tooltip text
    await expect(
      page.getByRole("dialog", { name: "Welcome to Llamanomicon" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Agents", exact: true }),
    ).toBeVisible();
  });

  test("not shown when localStorage has valid seeded state", async ({
    page,
  }) => {
    // Arrange — pre-populate localStorage before React mounts
    const seededStorage = buildMinimalStorage();
    await page.addInitScript((s: string) => {
      localStorage.setItem("llamanomicon-v2", s);
    }, seededStorage);
    await page.goto("/");
    await page.waitForTimeout(1500);

    const welcome = new WelcomeModal(page);

    // Assert
    await expect(welcome.heading).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();
  });
});

function encodeMap(entries: [string, unknown][]): unknown {
  return { __type: "Map", entries: entries.map(([k, v]) => [k, encode(v)]) };
}

function encodeSet(values: string[]): unknown {
  return { __type: "Set", values };
}

function encode(v: unknown): unknown {
  if (v instanceof Map) {
    return encodeMap([...v.entries()].map(([k, val]) => [k, encode(val)]));
  }
  if (v instanceof Set) {
    return encodeSet([...v]);
  }
  if (Array.isArray(v)) return v.map(encode);
  if (v !== null && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = encode(val);
    }
    return out;
  }
  return v;
}

function buildMinimalStorage(): string {
  const baseline = {
    snippets: encodeMap([]),
    skills: encodeMap([]),
    agents: encodeMap([
      [
        "agent-1",
        { id: "agent-1", name: "Test Agent", activeSet: encodeSet([]) },
      ],
    ]),
  };
  const state = { baseline, outputSettings: { theme: "light" } };
  return JSON.stringify({ state, version: 0 });
}
