import { test, expect } from "./fixtures";

test.describe("Agents panel", () => {
  test("renders seeded agents", async ({ app }) => {
    await expect(app.agents.getAgent(/Agent One/i)).toBeVisible();
    await expect(app.agents.getAgent(/Agent Two/i)).toBeVisible();

    await expect(app.page).toHaveScreenshot("agents-panel-seeded.png", {
      maxDiffPixels: 100,
    });
  });

  test("first agent is auto-selected on load", async ({ app }) => {
    await expect(app.agents.getAgent(/Agent One/i)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("clicking an agent selects it", async ({ app }) => {
    // Act
    await app.agents.clickAgent(/Agent Two/i);

    // Assert
    await expect(app.agents.getAgent(/Agent Two/i)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("adds a new agent", async ({ app }) => {
    // Arrange
    const modal = await app.agents.openAddDialog();
    await modal.fillField("Name", "New Test Agent");

    await expect(app.page).toHaveScreenshot("add-agent-dialog.png", {
      maxDiffPixels: 100,
    });

    // Act
    await modal.save();

    // Assert
    await expect(app.agents.getAgent(/New Test Agent/i)).toBeVisible();
  });

  test("edits an agent name", async ({ app }) => {
    // Act
    await app.agents.editAgent(/Agent One/i, "Renamed Agent");

    // Assert
    await expect(app.agents.getAgent(/Renamed Agent/i)).toBeVisible();
    await expect(app.agents.getAgent(/Agent One/i)).not.toBeVisible();
  });

  test("deletes an agent with confirmation", async ({ app }) => {
    // Act
    await app.agents.deleteAgent(/Agent One/i);

    // Assert
    await expect(app.agents.getAgent(/Agent One/i)).not.toBeVisible();
  });
});
