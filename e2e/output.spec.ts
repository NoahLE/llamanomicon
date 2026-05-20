import { test, expect } from "./fixtures";

test.describe("Output panels", () => {
  test.describe("OutputStructure", () => {
    test("shows heading and main UI elements", async ({ app }) => {
      await expect(app.outputStructure.heading).toBeVisible();
    });

    test("shows Coding accordion section when snippets are active", async ({
      app,
    }) => {
      // Agent One has Alpha Snippet (tagged Coding) active
      await expect(app.outputStructure.getSkillSection("Coding")).toBeVisible();
    });

    test("accordion shows active snippet name", async ({ app }) => {
      await expect(
        app.outputStructure.getSnippetInSection("Coding", "Alpha Snippet"),
      ).toBeVisible();

      await expect(app.page).toHaveScreenshot(
        "output-panel-with-active-snippet.png",
        { maxDiffPixels: 100 },
      );
    });

    test("activating a snippet adds it to the output structure", async ({
      app,
    }) => {
      // Arrange
      await app.skills.clickSkill(/Coding/i);

      // Act
      await app.snippets.clickSnippet(/Beta Snippet/i);

      // Assert
      await expect(
        app.outputStructure.getSnippetInSection("Coding", "Beta Snippet"),
      ).toBeVisible();
    });

    test("deactivating a snippet removes it from the accordion", async ({
      app,
    }) => {
      // Arrange
      await app.skills.clickSkill(/Coding/i);

      // Act
      await app.snippets.clickSnippet(/Alpha Snippet/i);

      // Assert
      await expect(
        app.outputStructure.getSnippetInSection("Coding", "Alpha Snippet"),
      ).not.toBeVisible();
    });
  });

  test.describe("RawOutput", () => {
    test("shows empty state message when no snippets are active", async ({
      app,
    }) => {
      // Arrange
      await app.skills.clickSkill(/Coding/i);

      // Act
      await app.snippets.clickSnippet(/Alpha Snippet/i);

      // Assert
      await expect(app.rawOutput.emptyState).toBeVisible();

      await expect(app.page).toHaveScreenshot("raw-output-empty-state.png", {
        maxDiffPixels: 100,
      });
    });

    test("shows XML output by default", async ({ app }) => {
      await expect(app.rawOutput.pre).toContainText("<coding>");
      await expect(app.rawOutput.pre).toContainText("Alpha snippet content.");
      await expect(app.rawOutput.pre).toContainText("</coding>");

      await expect(app.page).toHaveScreenshot("raw-output-xml-format.png", {
        maxDiffPixels: 100,
      });
    });

    test("switches to text output when Text button is clicked", async ({
      app,
    }) => {
      // Act
      await app.rawOutput.clickText();

      // Assert
      await expect(app.rawOutput.pre).not.toContainText("<coding>");
      await expect(app.rawOutput.pre).toContainText("Alpha snippet content.");

      await expect(app.page).toHaveScreenshot("raw-output-text-format.png", {
        maxDiffPixels: 100,
      });
    });

    test("switches back to XML when XML button is clicked", async ({ app }) => {
      // Arrange
      await app.rawOutput.clickText();

      // Act
      await app.rawOutput.clickXml();

      // Assert
      await expect(app.rawOutput.pre).toContainText("<coding>");
    });

    test("copy button is disabled when output is empty", async ({ app }) => {
      // Arrange
      await app.skills.clickSkill(/Coding/i);

      // Act
      await app.snippets.clickSnippet(/Alpha Snippet/i);

      // Assert
      await expect(app.rawOutput.copyButton).toBeDisabled();
    });

    test("copy button is enabled when output is present", async ({ app }) => {
      // Agent One has Alpha Snippet active so output is non-empty from the start
      await expect(app.rawOutput.pre).toContainText("Alpha snippet content.");
      await expect(app.rawOutput.copyButton).not.toBeDisabled();
    });
  });
});
