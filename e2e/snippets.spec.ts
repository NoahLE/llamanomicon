import { test, expect } from "./fixtures";

test.describe("Snippets panel", () => {
  test("shows untagged snippets when Untagged filter is active", async ({
    app,
  }) => {
    // Default: Untagged filter is selected. Gamma has no skills.
    await expect(app.snippets.getSnippet(/Gamma Snippet/i)).toBeVisible();
    await expect(app.snippets.getSnippet(/Alpha Snippet/i)).not.toBeVisible();
  });

  test("shows all snippets for a skill when that skill is selected", async ({
    app,
  }) => {
    // Arrange
    await app.skills.clickSkill(/Coding/i);

    // Assert
    await expect(app.snippets.getSnippet(/Alpha Snippet/i)).toBeVisible();
    await expect(app.snippets.getSnippet(/Beta Snippet/i)).toBeVisible();
    await expect(app.snippets.getSnippet(/Gamma Snippet/i)).not.toBeVisible();
  });

  test("adds a new snippet", async ({ app }) => {
    // Act
    await app.snippets.addSnippet(
      "Delta Snippet",
      "Delta content for testing.",
    );

    // Assert — new snippets are untagged, so switch to Untagged filter to see it
    await app.skills.clickSkill(/Untagged/i);
    await expect(app.snippets.getSnippet(/Delta Snippet/i)).toBeVisible();
  });

  test("edits a snippet name and text", async ({ app }) => {
    // Arrange
    await app.skills.clickSkill(/Coding/i);

    // Act
    await app.snippets.editSnippet(/Alpha Snippet/i, {
      name: "Renamed Alpha",
      text: "Updated alpha text.",
    });

    // Assert
    await expect(app.snippets.getSnippet(/Renamed Alpha/i)).toBeVisible();
  });

  test("deletes a snippet with confirmation", async ({ app }) => {
    // Arrange
    await app.skills.clickSkill(/Coding/i);

    // Act
    await app.snippets.deleteSnippet(/Alpha Snippet/i);

    // Assert
    await expect(app.snippets.getSnippet(/Alpha Snippet/i)).not.toBeVisible();
  });

  test("activates a snippet by clicking it", async ({ app }) => {
    // Arrange
    await app.skills.clickSkill(/Coding/i);

    // Act
    await app.snippets.clickSnippet(/Beta Snippet/i);

    // Assert
    await expect(app.snippets.getSnippet(/Beta Snippet/i)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("deactivates an active snippet by clicking it", async ({ app }) => {
    // Arrange
    await app.skills.clickSkill(/Coding/i);

    // Act
    await app.snippets.clickSnippet(/Alpha Snippet/i);

    // Assert
    await expect(app.snippets.getSnippet(/Alpha Snippet/i)).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("tags a snippet with a skill via edit modal", async ({ app }) => {
    // Arrange
    await app.skills.clickSkill(/Untagged/i);

    // Act
    await app.snippets.tagSnippet(/Gamma Snippet/i, "Tone");

    // Assert — Gamma should no longer appear under Untagged
    await expect(app.snippets.getSnippet(/Gamma Snippet/i)).not.toBeVisible();

    await app.skills.clickSkill(/Tone/i);
    await expect(app.snippets.getSnippet(/Gamma Snippet/i)).toBeVisible();
  });
});
