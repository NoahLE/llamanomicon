import { describe, it, expect, beforeEach } from "vitest";
import { createSnippetsSlice } from "@/store/useSnippets";
import { createSkillsSlice } from "@/store/useSkills";
import { createAgentsSlice } from "@/store/useAgents";
import { createAgentsSnippetsSlice } from "@/store/useAgentSnippets";
import {
  createDataControlsSlice,
  selectHasUnsavedChanges,
} from "@/store/useDataControls";
import { createTestStore } from "@/store/tests/testUtils";
import type { AppState } from "@/types";

function makeFullStore() {
  return createTestStore((set, get, api) => ({
    ...createSnippetsSlice(set, get, api),
    ...createSkillsSlice(set, get, api),
    ...createAgentsSlice(set, get, api),
    ...createAgentsSnippetsSlice(set, get, api),
    ...createDataControlsSlice(set, get, api),
  }));
}

function makeAppState(overrides?: Partial<AppState>): AppState {
  return {
    snippets: {
      s1: { id: "s1", name: "Snippet 1", text: "hello", skills: [] },
    },
    skills: {
      k1: { id: "k1", name: "Skill 1" },
    },
    agents: {
      a1: { id: "a1", name: "Agent A", activeSet: ["s1"] },
    },
    outputSettings: { theme: "light" },
    ...overrides,
  };
}

describe("selectHasUnsavedChanges", () => {
  let store: ReturnType<typeof makeFullStore>;

  beforeEach(() => {
    store = makeFullStore();
  });

  it("returns false when live state equals baseline", () => {
    expect(selectHasUnsavedChanges(store.getState())).toBe(false);
  });

  it("returns true after adding a snippet (live diverges from baseline)", () => {
    store.getState().addSnippet("New", "new text");
    expect(selectHasUnsavedChanges(store.getState())).toBe(true);
  });

  it("returns false again after saveSession() commits the change", () => {
    store.getState().addSnippet("New", "new text");
    store.getState().saveSession();
    expect(selectHasUnsavedChanges(store.getState())).toBe(false);
  });

  it("returns true after adding a skill", () => {
    store.getState().addSkill("New Skill");
    expect(selectHasUnsavedChanges(store.getState())).toBe(true);
  });

  it("returns true after adding an agent", () => {
    store.getState().addAgent("New Agent");
    expect(selectHasUnsavedChanges(store.getState())).toBe(true);
  });
});

describe("saveSession", () => {
  let store: ReturnType<typeof makeFullStore>;

  beforeEach(() => {
    store = makeFullStore();
  });

  it("updates baseline to match live state", () => {
    store.getState().addSnippet("Saved", "saved text");
    const liveSize = store.getState().snippets.size;

    store.getState().saveSession();

    expect(store.getState().baseline.snippets.size).toBe(liveSize);
  });

  it("selectHasUnsavedChanges returns false after save", () => {
    store.getState().addSnippet("Saved", "saved text");
    store.getState().saveSession();
    expect(selectHasUnsavedChanges(store.getState())).toBe(false);
  });
});

describe("discardSession", () => {
  let store: ReturnType<typeof makeFullStore>;

  beforeEach(() => {
    store = makeFullStore();
  });

  it("reverts live state to baseline", () => {
    // Baseline is empty. Add a snippet, then discard.
    store.getState().addSnippet("Temp", "temp");
    expect(store.getState().snippets.size).toBe(1);

    store.getState().discardSession();

    expect(store.getState().snippets.size).toBe(0);
  });

  it("rebuilds snippetsBySkill index after discard", () => {
    // Set a baseline with a snippet tagged to a skill
    store.getState().importState(
      makeAppState({
        snippets: {
          s1: { id: "s1", name: "S1", text: "t", skills: ["k1"] },
        },
        skills: { k1: { id: "k1", name: "K1" } },
        agents: { a1: { id: "a1", name: "A", activeSet: [] } },
      }),
    );
    store.getState().saveSession();

    // Mutate live state
    store.getState().addSnippet("Temp", "temp");

    // Discard reverts to saved baseline
    store.getState().discardSession();

    expect(store.getState().snippetsBySkill.get("k1")).toEqual(new Set(["s1"]));
  });

  it("preserves activeAgentId when agent still exists after discard", () => {
    store.getState().addAgent("Persistent");
    const agentId = [...store.getState().agents.keys()][0]!;
    store.getState().setActiveAgentId(agentId);
    store.getState().saveSession();

    // Add a temporary snippet then discard
    store.getState().addSnippet("Temp", "t");
    store.getState().discardSession();

    expect(store.getState().activeAgentId).toBe(agentId);
  });

  it("updates activeAgentId to first alphabetical agent if previous active was removed", () => {
    // Import state with two agents: Alpha and Beta
    store.getState().importState(
      makeAppState({
        agents: {
          aA: { id: "aA", name: "Alpha", activeSet: [] },
          aB: { id: "aB", name: "Beta", activeSet: [] },
        },
        snippets: {},
        skills: {},
      }),
    );
    store.getState().saveSession();

    // Add a new agent "Zulu" and set it as active
    store.getState().addAgent("Zulu");
    const zuluId = [...store.getState().agents.keys()].find(
      (id) => store.getState().agents.get(id)?.name === "Zulu",
    )!;
    store.getState().setActiveAgentId(zuluId);

    // Discard — Zulu wasn't in baseline, so falls back to first alphabetical
    store.getState().discardSession();

    expect(store.getState().activeAgentId).toBe("aA"); // Alpha
  });
});

describe("clearData", () => {
  let store: ReturnType<typeof makeFullStore>;

  beforeEach(() => {
    store = makeFullStore();
    store.getState().addSnippet("S", "t");
    store.getState().addSkill("K");
    store.getState().addAgent("A");
  });

  it("empties all maps", () => {
    store.getState().clearData();
    expect(store.getState().snippets.size).toBe(0);
    expect(store.getState().skills.size).toBe(0);
    expect(store.getState().agents.size).toBe(0);
  });

  it("resets activeAgentId and activeSkillId to null", () => {
    store.getState().clearData();
    expect(store.getState().activeAgentId).toBe(null);
    expect(store.getState().activeSkillId).toBe(null);
  });

  it("resets outputSettings to default", () => {
    store.getState().updateOutputSettings({ theme: "dark" });
    store.getState().clearData();
    expect(store.getState().outputSettings.theme).toBe("light");
  });

  it("also clears baseline so no unsaved changes exist", () => {
    store.getState().clearData();
    expect(selectHasUnsavedChanges(store.getState())).toBe(false);
  });
});

describe("importState", () => {
  let store: ReturnType<typeof makeFullStore>;

  beforeEach(() => {
    store = makeFullStore();
  });

  it("reconstructs snippets with Set<string> skills from serialized arrays", () => {
    store.getState().importState(makeAppState());
    const snippet = store.getState().snippets.get("s1");
    expect(snippet?.skills).toBeInstanceOf(Set);
  });

  it("reconstructs agents with Set<string> activeSet from serialized arrays", () => {
    store.getState().importState(makeAppState());
    const agent = store.getState().agents.get("a1");
    expect(agent?.activeSet).toBeInstanceOf(Set);
    expect(agent?.activeSet.has("s1")).toBe(true);
  });

  it("sets activeAgentId to the first agent alphabetically by name", () => {
    store.getState().importState(
      makeAppState({
        agents: {
          aZ: { id: "aZ", name: "Zebra", activeSet: [] },
          aA: { id: "aA", name: "Alpha", activeSet: [] },
        },
      }),
    );
    expect(store.getState().activeAgentId).toBe("aA");
  });

  it("resets activeSkillId to null", () => {
    store.getState().setActiveSkillId("k1");
    store.getState().importState(makeAppState());
    expect(store.getState().activeSkillId).toBe(null);
  });

  it("rebuilds snippetsBySkill index from snippet skill tags", () => {
    store.getState().importState(
      makeAppState({
        snippets: {
          s1: { id: "s1", name: "S1", text: "t", skills: ["k1"] },
        },
      }),
    );
    expect(store.getState().snippetsBySkill.get("k1")).toEqual(new Set(["s1"]));
  });

  it("sets outputSettings from the imported state", () => {
    store
      .getState()
      .importState(makeAppState({ outputSettings: { theme: "dark" } }));
    expect(store.getState().outputSettings.theme).toBe("dark");
  });
});
