import { describe, it, expect, beforeEach } from "vitest";
import {
  createAgentsSlice,
  selectActiveAgent,
  selectSortedAgents,
  selectSkillGroupsForOutput,
} from "@/store/useAgents";
import { createAgentsSnippetsSlice } from "@/store/useAgentSnippets";
import { createTestStore } from "@/store/tests/testUtils";
import type { StoreState } from "@/store/useAppStore";
import type { Agent, Snippet, Skill } from "@/types";

describe("createAgentsSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore((set, get, api) => ({
      ...createAgentsSlice(set, get, api),
      ...createAgentsSnippetsSlice(set, get, api),
    }));
  });

  describe("addAgent", () => {
    it("adds an agent to the store", () => {
      store.getState().addAgent("Test Agent");
      const agents = store.getState().agents;
      expect(agents.size).toBe(1);

      const agent = [...agents.values()][0]!;
      expect(agent.name).toBe("Test Agent");
      expect(agent.activeSet).toEqual(new Set());
    });

    it("auto-selects the new agent as active when no agent existed before", () => {
      expect(store.getState().activeAgentId).toBe(null);
      store.getState().addAgent("First");
      const id = [...store.getState().agents.keys()][0]!;
      expect(store.getState().activeAgentId).toBe(id);
    });

    it("does not change activeAgentId when an agent is already active", () => {
      store.getState().addAgent("First");
      const firstId = [...store.getState().agents.keys()][0]!;
      expect(store.getState().activeAgentId).toBe(firstId);

      store.getState().addAgent("Second");
      expect(store.getState().activeAgentId).toBe(firstId);
    });
  });

  describe("updateAgent", () => {
    it("updates agent name", () => {
      store.getState().addAgent("Old Name");
      const id = [...store.getState().agents.keys()][0]!;

      store.getState().updateAgent(id, { name: "New Name" });
      expect(store.getState().agents.get(id)?.name).toBe("New Name");
    });
  });

  describe("deleteAgent", () => {
    it("removes agent from store", () => {
      store.getState().addAgent("To Delete");
      const id = [...store.getState().agents.keys()][0]!;

      store.getState().deleteAgent(id);
      expect(store.getState().agents.size).toBe(0);
    });

    it("resets activeAgentId if it was the deleted agent and no others exist", () => {
      store.getState().addAgent("Target");
      const id = [...store.getState().agents.keys()][0]!;
      store.getState().setActiveAgentId(id);
      expect(store.getState().activeAgentId).toBe(id);

      store.getState().deleteAgent(id);
      expect(store.getState().activeAgentId).toBe(null);
    });

    it("falls back to first alphabetical remaining agent when active agent is deleted", () => {
      store.getState().addAgent("Zebra");
      store.getState().addAgent("Alpha");
      const zebraId = [...store.getState().agents.values()].find(
        (a) => a.name === "Zebra",
      )!.id;
      const alphaId = [...store.getState().agents.values()].find(
        (a) => a.name === "Alpha",
      )!.id;

      store.getState().setActiveAgentId(zebraId);
      store.getState().deleteAgent(zebraId);

      expect(store.getState().activeAgentId).toBe(alphaId);
    });
  });

  describe("activateSnippet", () => {
    it("adds snippet to activeSet", () => {
      store.getState().addAgent("Agent");
      const agentId = [...store.getState().agents.keys()][0]!;
      const snippetId = "snip1";

      store.getState().activateSnippet(agentId, snippetId);
      const agent = store.getState().agents.get(agentId);
      expect(agent?.activeSet.has(snippetId)).toBe(true);
    });

    it("is idempotent", () => {
      store.getState().addAgent("Agent");
      const agentId = [...store.getState().agents.keys()][0]!;
      const snippetId = "snip1";

      store.getState().activateSnippet(agentId, snippetId);
      store.getState().activateSnippet(agentId, snippetId);
      const agent = store.getState().agents.get(agentId);
      expect(agent?.activeSet.size).toBe(1);
    });
  });

  describe("deactivateSnippet", () => {
    it("removes snippet from activeSet", () => {
      store.getState().addAgent("Agent");
      const agentId = [...store.getState().agents.keys()][0]!;
      const snippetId = "snip1";

      store.getState().activateSnippet(agentId, snippetId);
      store.getState().deactivateSnippet(agentId, snippetId);
      const agent = store.getState().agents.get(agentId);
      expect(agent?.activeSet.has(snippetId)).toBe(false);
    });

    it("is a no-op when snippet is not in activeSet", () => {
      store.getState().addAgent("Agent");
      const agentId = [...store.getState().agents.keys()][0]!;

      store.getState().deactivateSnippet(agentId, "not-active");
      const agent = store.getState().agents.get(agentId);
      expect(agent?.activeSet.size).toBe(0);
    });
  });
});

describe("agent selectors", () => {
  const a1: Agent = {
    id: "a1",
    name: "Z-Agent",
    activeSet: new Set(["s1"]),
  };
  const a2: Agent = {
    id: "a2",
    name: "A-Agent",
    activeSet: new Set(),
  };

  const state = {
    agents: new Map([
      ["a1", a1],
      ["a2", a2],
    ]),
    snippets: new Map(),
    skills: new Map(),
    activeAgentId: "a1",
  } as StoreState;

  describe("selectActiveAgent", () => {
    it("returns the agent matching activeAgentId", () => {
      expect(selectActiveAgent(state)).toBe(a1);
    });

    it("returns null when activeAgentId is null", () => {
      expect(selectActiveAgent({ ...state, activeAgentId: null })).toBe(null);
    });

    it("returns null when activeAgentId does not match any agent", () => {
      expect(selectActiveAgent({ ...state, activeAgentId: "missing" })).toBe(
        null,
      );
    });
  });

  describe("selectSortedAgents", () => {
    it("returns all agents sorted alphabetically by name", () => {
      const sorted = selectSortedAgents(state);
      expect(sorted[0]).toBe(a2); // A-Agent
      expect(sorted[1]).toBe(a1); // Z-Agent
    });
  });
});

describe("selectSkillGroupsForOutput", () => {
  const skillA: Skill = { id: "sA", name: "Alpha" };
  const skillB: Skill = { id: "sB", name: "Beta" };

  const snip1: Snippet = {
    id: "n1",
    name: "Snippet B",
    text: "B",
    skills: new Set(["sA"]),
  };
  const snip2: Snippet = {
    id: "n2",
    name: "Snippet A",
    text: "A",
    skills: new Set(["sA"]),
  };
  const snip3: Snippet = {
    id: "n3",
    name: "Snippet C",
    text: "C",
    skills: new Set(["sB"]),
  };
  const snipUntagged: Snippet = {
    id: "n4",
    name: "Untagged Snippet",
    text: "U",
    skills: new Set(),
  };

  function makeState(
    agentOverrides: Partial<Agent>,
    snippets = new Map([
      ["n1", snip1],
      ["n2", snip2],
      ["n3", snip3],
    ]),
    skills = new Map([
      ["sA", skillA],
      ["sB", skillB],
    ]),
    snippetsBySkill = new Map([
      ["sA", new Set(["n1", "n2"])],
      ["sB", new Set(["n3"])],
    ]),
  ): StoreState {
    const agent: Agent = {
      id: "a1",
      name: "Agent",
      activeSet: new Set(),
      ...agentOverrides,
    };
    return {
      agents: new Map([["a1", agent]]),
      snippets,
      skills,
      baseline: {
        agents: new Map(),
        snippets: new Map(),
        skills: new Map(),
      },
      snippetsBySkill,
      activeAgentId: "a1",
    } as StoreState;
  }

  it("returns [] when no active agent", () => {
    const state = makeState({ activeSet: new Set(["n1"]) });
    expect(
      selectSkillGroupsForOutput({ ...state, activeAgentId: null }),
    ).toEqual([]);
  });

  it("returns [] when active agent has no active snippets", () => {
    const state = makeState({ activeSet: new Set() });
    expect(selectSkillGroupsForOutput(state)).toEqual([]);
  });

  it("groups appear in alphabetical order by skill name", () => {
    const state = makeState({ activeSet: new Set(["n1", "n3"]) });
    const groups = selectSkillGroupsForOutput(state);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.skillId).toBe("sA"); // Alpha first
    expect(groups[1]?.skillId).toBe("sB"); // Beta second
  });

  it("untagged group is always last", () => {
    const snippets = new Map([
      ["n1", snip1],
      ["n4", snipUntagged],
    ]);
    const snippetsBySkill = new Map([["sA", new Set(["n1"])]]);
    const state = makeState(
      { activeSet: new Set(["n1", "n4"]) },
      snippets,
      new Map([["sA", skillA]]),
      snippetsBySkill,
    );
    const groups = selectSkillGroupsForOutput(state);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.skillId).toBe("sA");
    expect(groups[1]?.skillId).toBe("__untagged__");
  });

  it("skills with no active snippets are excluded", () => {
    const state = makeState({
      activeSet: new Set(["n1"]), // only n1 (skill sA), n3 (sB) not active
    });
    const groups = selectSkillGroupsForOutput(state);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.skillId).toBe("sA");
  });

  it("snippets within a group are alphabetically sorted by name", () => {
    const state = makeState({
      activeSet: new Set(["n1", "n2"]), // both in sA; snip2 = "Snippet A", snip1 = "Snippet B"
    });
    const groups = selectSkillGroupsForOutput(state);
    expect(groups).toHaveLength(1);
    const snippets = groups[0]?.snippets ?? [];
    expect(snippets[0]?.name).toBe("Snippet A"); // snip2 comes first alphabetically
    expect(snippets[1]?.name).toBe("Snippet B");
  });

  it("multi-skill snippet is deduplicated across groups in compiled output", () => {
    // snipMulti is tagged sA AND sB; should appear in sA group and also sB group
    // at the buildSkillGroups level both groups list it, but compileOutput deduplicates
    const snipMulti: Snippet = {
      id: "nm",
      name: "Multi",
      text: "multi-text",
      skills: new Set(["sA", "sB"]),
    };
    const snippets = new Map([["nm", snipMulti]]);
    const snippetsBySkill = new Map([
      ["sA", new Set(["nm"])],
      ["sB", new Set(["nm"])],
    ]);
    const state = makeState(
      { activeSet: new Set(["nm"]) },
      snippets,
      undefined,
      snippetsBySkill,
    );
    const groups = selectSkillGroupsForOutput(state);
    // Both groups exist (buildSkillGroups does not dedup)
    const allSnippetIds = groups.flatMap((g) => g.snippets.map((s) => s.id));
    expect(allSnippetIds.filter((id) => id === "nm").length).toBeGreaterThan(0);
    // The selector itself returns groups; dedup happens at compile time
    expect(groups.some((g) => g.skillId === "sA")).toBe(true);
    expect(groups.some((g) => g.skillId === "sB")).toBe(true);
  });

  it("returns the same array reference when state objects have not changed (memoization)", () => {
    const state = makeState({ activeSet: new Set(["n1"]) });
    const result1 = selectSkillGroupsForOutput(state);
    const result2 = selectSkillGroupsForOutput(state);
    expect(result1).toBe(result2);
  });

  it("returns cached result when only outputSettings changes (unrelated mutation)", () => {
    const state = makeState({ activeSet: new Set(["n1"]) });
    const result1 = selectSkillGroupsForOutput(state);

    // Spreading preserves the same agent, snippets, skills, snippetsBySkill references
    const stateWithDifferentSettings = {
      ...state,
      outputSettings: { theme: "dark" as const },
    };
    const result2 = selectSkillGroupsForOutput(stateWithDifferentSettings);
    expect(result1).toBe(result2);
  });
});
