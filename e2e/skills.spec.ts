import { test, expect } from "./fixtures";

test.describe("Skills panel", () => {
  test("renders seeded skills and Untagged virtual filter", async ({ app }) => {
    await expect(app.skills.getSkill(/Untagged/i)).toBeVisible();
    await expect(app.skills.getSkill(/Coding/i)).toBeVisible();
    await expect(app.skills.getSkill(/Tone/i)).toBeVisible();
  });

  test("Untagged is selected by default", async ({ app }) => {
    await expect(app.skills.getSkill(/Untagged/i)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("clicking a skill selects it", async ({ app }) => {
    // Act
    await app.skills.clickSkill(/Coding/i);

    // Assert
    await expect(app.skills.getSkill(/Coding/i)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("adds a new skill", async ({ app }) => {
    // Act
    await app.skills.addSkill("New Skill");

    // Assert
    await expect(app.skills.getSkill(/New Skill/i)).toBeVisible();
  });

  test("edits a skill name", async ({ app }) => {
    // Act
    await app.skills.editSkill(/Coding/i, "Refactored Skill");

    // Assert
    await expect(app.skills.getSkill(/Refactored Skill/i)).toBeVisible();
    await expect(app.skills.getSkill(/^Coding$/i)).not.toBeVisible();
  });

  test("deletes a skill with confirmation", async ({ app }) => {
    // Act
    await app.skills.deleteSkill(/Tone/i);

    // Assert
    await expect(app.skills.getSkill(/^Tone$/i)).not.toBeVisible();
  });

  test("active/total snippet count updates when agent activates snippets", async ({
    app,
  }) => {
    // Agent One has snip-1 (tagged Coding) active — Coding shows 1/2 active
    await expect(
      app.skills.getSkill(/Coding/i).getByText(/1\/2 active/i),
    ).toBeVisible();
  });

  test("bulk activate all snippets for a skill", async ({ app }) => {
    // Act
    await app.skills.activateAll(/Coding/i);

    // Assert
    await expect(
      app.skills.getSkill(/Coding/i).getByText(/2\/2 active/i),
    ).toBeVisible();
  });

  test("bulk deactivate all snippets for a skill", async ({ app }) => {
    // Act
    await app.skills.deactivateAll(/Coding/i);

    // Assert
    await expect(
      app.skills.getSkill(/Coding/i).getByText(/0\/2 active/i),
    ).toBeVisible();
  });
});
