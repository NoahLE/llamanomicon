import { test, expect } from "./fixtures";

test.describe("Session controls", () => {
  test("Save and Reset buttons are disabled when there are no unsaved changes", async ({
    app,
  }) => {
    await expect(app.sessionControls.saveButton).toBeDisabled();
    await expect(app.sessionControls.resetButton).toBeDisabled();
  });

  test("Save and Reset become enabled after a change", async ({ app }) => {
    // Act
    await app.agents.addAgent("Temp Agent");

    // Assert
    await expect(app.sessionControls.saveButton).not.toBeDisabled();
    await expect(app.sessionControls.resetButton).not.toBeDisabled();
  });

  test("saves session and disables Save/Reset buttons", async ({ app }) => {
    // Arrange
    await app.agents.addAgent("Saved Agent");

    // Act
    await app.sessionControls.save();

    // Assert
    await expect(app.sessionControls.saveButton).toBeDisabled();
    await expect(app.sessionControls.resetButton).toBeDisabled();
  });

  test("discards changes restoring prior state", async ({ app }) => {
    // Arrange
    await app.agents.addAgent("Discardable Agent");
    await expect(app.agents.getAgent(/Discardable Agent/i)).toBeVisible();

    // Act
    await app.sessionControls.reset();

    // Assert
    await expect(app.agents.getAgent(/Discardable Agent/i)).not.toBeVisible();
    await expect(app.sessionControls.saveButton).toBeDisabled();
  });

  test("New Session button opens confirmation modal", async ({ app }) => {
    // Act
    await app.sessionControls.openNewSession();

    // Assert
    await expect(
      app.page.getByRole("heading", { name: "Start New Session?" }),
    ).toBeVisible();
  });

  test("cancelling New Session modal leaves data intact", async ({ app }) => {
    // Arrange
    await app.sessionControls.openNewSession();

    // Act
    await app.page.getByRole("button", { name: "Cancel" }).click();

    // Assert
    await expect(app.agents.getAgent(/Agent One/i)).toBeVisible();
  });

  test("confirming New Session clears all data and opens WelcomeModal", async ({
    app,
  }) => {
    // Arrange
    await app.sessionControls.openNewSession();

    // Act
    await app.page.getByRole("button", { name: "New Session" }).click();

    // Assert
    await expect(app.page.getByText("Welcome to Llamanomicon")).toBeVisible();
  });
});
