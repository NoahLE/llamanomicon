import { test, expect } from "./fixtures";

test.describe("Documentation modal", () => {
  test("opens when the book icon button is clicked", async ({ app }) => {
    // Act
    await app.docsModal.open();

    // Assert
    await expect(
      app.page.getByRole("heading", { name: "Documentation" }),
    ).toBeVisible();

    await expect(app.page).toHaveScreenshot(
      "docs-modal-prompt-engineering-tab.png",
      { maxDiffPixels: 100 },
    );
  });

  test("renders all four tabs", async ({ app }) => {
    // Arrange
    await app.docsModal.open();

    // Assert
    await expect(app.docsModal.getTab(/Introduction/i)).toBeVisible();
    await expect(app.docsModal.getTab(/Tips/i)).toBeVisible();
    await expect(app.docsModal.getTab(/Tutorials/i)).toBeVisible();
    await expect(app.docsModal.getTab(/Sources/i)).toBeVisible();
  });

  test("switches tab content when a different tab is clicked", async ({
    app,
  }) => {
    // Arrange
    await app.docsModal.open();

    // Act
    await app.docsModal.clickTab(/Tips/i);

    // Assert
    await expect(app.page.getByRole("tabpanel")).toBeVisible();

    await expect(app.page).toHaveScreenshot(
      "docs-modal-prompting-tips-tab.png",
      {
        maxDiffPixels: 100,
      },
    );
  });

  test("closes when the close button is clicked", async ({ app }) => {
    // Arrange
    await app.docsModal.open();
    await expect(
      app.page.getByRole("heading", { name: "Documentation" }),
    ).toBeVisible();

    // Act
    await app.docsModal.close();

    // Assert
    await expect(
      app.page.getByRole("heading", { name: "Documentation" }),
    ).not.toBeVisible();
  });
});
