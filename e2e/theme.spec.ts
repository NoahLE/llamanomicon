import { test, expect } from "./fixtures";
import { buildSeededStorage } from "./fixtures";

test.describe("Theme toggle", () => {
  test("switches from dark to light mode", async ({ page }) => {
    // Arrange — seed app in dark mode before React mounts
    await page.addInitScript((storage: string) => {
      localStorage.setItem("llamanomicon-v2", storage);
      localStorage.setItem("llamanomicon-theme", "dark");
    }, buildSeededStorage());
    await page.goto("/");
    await page.getByRole("heading", { name: "Agents" }).waitFor();

    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    await expect(page).toHaveScreenshot("app-dark-theme.png", {
      maxDiffPixels: 100,
    });

    // Act
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: /Switch to light mode/i }).click();
    await page.getByRole("button", { name: "Close" }).first().click();

    // Assert
    await expect(html).toHaveAttribute("data-theme", "light");

    await expect(page).toHaveScreenshot("app-light-theme.png", {
      maxDiffPixels: 100,
    });
  });

  test("switches from light to dark mode", async ({ page }) => {
    // Arrange
    await page.addInitScript((storage: string) => {
      localStorage.setItem("llamanomicon-v2", storage);
      localStorage.setItem("llamanomicon-theme", "light");
    }, buildSeededStorage());
    await page.goto("/");
    await page.getByRole("heading", { name: "Agents" }).waitFor();

    // Act
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: /Switch to dark mode/i }).click();
    await page.getByRole("button", { name: "Close" }).first().click();

    // Assert
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("persists theme choice across reload", async ({ page }) => {
    // Arrange — one-shot flag ensures initScript only seeds on the first navigation
    await page.addInitScript((storage: string) => {
      if (!sessionStorage.getItem("__test_seeded__")) {
        sessionStorage.setItem("__test_seeded__", "1");
        localStorage.setItem("llamanomicon-v2", storage);
        localStorage.setItem("llamanomicon-theme", "light");
      }
    }, buildSeededStorage());
    await page.goto("/");
    await page.getByRole("heading", { name: "Agents" }).waitFor();

    // Act
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: /Switch to dark mode/i }).click();
    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await page.getByRole("heading", { name: "Agents" }).waitFor();

    // Assert
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
