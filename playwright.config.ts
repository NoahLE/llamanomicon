/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: 5,
  reporter: "list",
  // All baseline snapshots live in e2e/snapshots/, organised by spec name and
  // browser project. This keeps visual baselines in a single reviewable tree
  // rather than scattered <spec>.ts-snapshots/ siblings next to every test file.
  snapshotDir: "./e2e/snapshots",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{projectName}/{arg}{ext}",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    // Clear localStorage before each test so tests are isolated
    storageState: undefined,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // devices["Desktop Chrome"] defaults to 1280×720 which clips the right
        // Output column. The 3-column layout needs ~1392px minimum (min-w-sm +
        // min-w-md + min-w-lg + margins/gaps), so 1600×900 is the safe floor.
        viewport: { width: 1600, height: 900 },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
