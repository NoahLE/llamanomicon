import { test, expect } from "./fixtures";

/** Minimal valid AppState JSON that can be imported. */
const IMPORT_PAYLOAD = JSON.stringify({
  snippets: {
    "imported-snip": {
      id: "imported-snip",
      name: "Imported Snippet",
      text: "Imported content.",
      skills: [],
    },
  },
  skills: {},
  agents: {
    "imported-agent": {
      id: "imported-agent",
      name: "Imported Agent",
      activeSet: [],
    },
  },
  outputSettings: { theme: "light" },
});

test.describe("Import", () => {
  test("imports state from a JSON file replacing existing data", async ({
    app,
  }) => {
    // Arrange — override showOpenFilePicker so no real dialog opens
    await app.page.addInitScript((payload: string) => {
      const blob = new Blob([payload], { type: "application/json" });
      const file = new File([blob], "test-import.json", {
        type: "application/json",
      });
      Object.defineProperty(window, "showOpenFilePicker", {
        value: async () => {
          const handle = {
            getFile: async () => file,
          } as unknown as FileSystemFileHandle;
          return [handle];
        },
        writable: true,
        configurable: true,
      });
    }, IMPORT_PAYLOAD);
    await app.page.reload();
    await app.page.getByRole("heading", { name: "Agents" }).waitFor();

    // Act
    await app.page.getByRole("button", { name: "Settings" }).click();
    await app.page
      .getByRole("button", { name: "Import state from JSON file" })
      .click();

    // Assert
    await expect(app.agents.getAgent(/Imported Agent/i)).toBeVisible();
    await expect(app.agents.getAgent(/Agent One/i)).not.toBeVisible();
  });

  test("shows an error alert when invalid JSON is imported", async ({
    app,
  }) => {
    // Arrange
    await app.page.addInitScript(() => {
      const blob = new Blob(["this is not json"], { type: "application/json" });
      const file = new File([blob], "bad.json", { type: "application/json" });
      Object.defineProperty(window, "showOpenFilePicker", {
        value: async () => {
          const handle = {
            getFile: async () => file,
          } as unknown as FileSystemFileHandle;
          return [handle];
        },
        writable: true,
        configurable: true,
      });
    });
    await app.page.reload();
    await app.page.getByRole("heading", { name: "Agents" }).waitFor();

    // Act
    await app.page.getByRole("button", { name: "Settings" }).click();
    await app.page
      .getByRole("button", { name: "Import state from JSON file" })
      .click();

    // Assert
    await expect(app.page.getByRole("alert")).toBeVisible();
    await expect(app.page.getByRole("alert")).toContainText(/invalid/i);
  });
});

test.describe("Export", () => {
  test("export button triggers a download without throwing", async ({
    app,
  }) => {
    // Arrange — override showSaveFilePicker to capture the written JSON
    await app.page.addInitScript(() => {
      (window as Window & { __exportedJson?: string }).__exportedJson =
        undefined;
      Object.defineProperty(window, "showSaveFilePicker", {
        value: async () => {
          const handle = {
            createWritable: async () => ({
              write: async (data: unknown) => {
                (
                  window as Window & { __exportedJson?: string }
                ).__exportedJson =
                  typeof data === "string" ? data : JSON.stringify(data);
              },
              close: async () => undefined,
            }),
          } as unknown as FileSystemFileHandle;
          return handle;
        },
        writable: true,
        configurable: true,
      });
    });
    await app.page.reload();
    await app.page.getByRole("heading", { name: "Agents" }).waitFor();

    // Act
    await app.page.getByRole("button", { name: "Settings" }).click();
    await app.page
      .getByRole("button", { name: "Export state to JSON file" })
      .click();

    // Assert
    const exported = await app.page.evaluate(
      () => (window as Window & { __exportedJson?: string }).__exportedJson,
    );
    expect(exported).toBeTruthy();
    const parsed = JSON.parse(exported as string) as Record<string, unknown>;
    expect(parsed).toHaveProperty("snippets");
    expect(parsed).toHaveProperty("skills");
    expect(parsed).toHaveProperty("agents");
    expect(parsed).toHaveProperty("outputSettings");
  });
});
