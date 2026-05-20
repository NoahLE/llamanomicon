import type { StoreState } from "@/store/useAppStore";
import type {
  AppState,
  DataState,
  OutputSettings,
  SerializedSnippet,
  SerializedAgent,
  SerializedSkill,
} from "@/types";

function formatDate(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${date}-${hh}-${mm}`;
}

export function validateAppState(data: unknown): AppState {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid file: expected a JSON object");
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.snippets !== "object" || obj.snippets === null) {
    throw new Error('Invalid file: missing or invalid "snippets" object');
  }

  if (typeof obj.skills !== "object" || obj.skills === null) {
    throw new Error('Invalid file: missing or invalid "skills" object');
  }

  if (typeof obj.agents !== "object" || obj.agents === null) {
    throw new Error('Invalid file: missing or invalid "agents" object');
  }

  if (typeof obj.outputSettings !== "object" || obj.outputSettings === null) {
    throw new Error('Invalid file: missing "outputSettings"');
  }

  return data as AppState;
}

interface ExportableState {
  baseline: DataState;
  outputSettings: OutputSettings;
}

export function serializeState(s: ExportableState): AppState {
  const snippets: Record<string, SerializedSnippet> = {};
  for (const [id, snip] of s.baseline.snippets) {
    snippets[id] = { ...snip, skills: [...snip.skills] };
  }

  const skills: Record<string, SerializedSkill> = {};
  for (const [id, skill] of s.baseline.skills) {
    skills[id] = skill;
  }

  const agents: Record<string, SerializedAgent> = {};
  for (const [id, agent] of s.baseline.agents) {
    agents[id] = {
      ...agent,
      activeSet: [...agent.activeSet],
    };
  }

  return {
    snippets,
    skills,
    agents,
    outputSettings: s.outputSettings,
  };
}

// StoreState satisfies ExportableState — accepts the full store state for convenience
export async function exportState(s: StoreState): Promise<void> {
  const serialized = serializeState(s);
  const json = JSON.stringify(
    { ...serialized, exportedAt: formatDate() },
    null,
    2,
  );
  const filename = `llamanomicon-export-${formatDate()}.json`;

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (
        window as Window & {
          showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
        }
      ).showSaveFilePicker({
        suggestedName: filename,
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      throw err;
    }
  } else {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Returns null if the user cancelled the file picker without selecting a file.
export async function importStateFromFile(): Promise<AppState | null> {
  let text: string;

  if ("showOpenFilePicker" in window) {
    try {
      const handles = await (
        window as Window & {
          showOpenFilePicker: (
            opts: unknown,
          ) => Promise<FileSystemFileHandle[]>;
        }
      ).showOpenFilePicker({
        types: [
          { description: "JSON", accept: { "application/json": [".json"] } },
        ],
      });
      const handle = handles[0];
      if (!handle) return null;
      const file = await handle.getFile();
      text = await file.text();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return null;
      throw err;
    }
  } else {
    const result = await new Promise<string | null>((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      };
      input.click();
    });
    if (result === null) return null;
    text = result;
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Invalid file: not valid JSON");
  }

  return validateAppState(data);
}
