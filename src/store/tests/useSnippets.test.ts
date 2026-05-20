import { describe, it, expect, beforeEach } from "vitest";
import {
  createSnippetsSlice,
  selectAllSnippets,
  selectUntaggedSnippets,
  selectSnippetsForSkill,
} from "@/store/useSnippets";
import { selectUntaggedSnippetCount } from "@/store/useSkills";
import { createTestStore } from "@/store/tests/testUtils";
import type { StoreState } from "@/store/useAppStore";
import type { Snippet } from "@/types";

describe("createSnippetsSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore(createSnippetsSlice);
  });

  describe("addSnippet", () => {
    it("adds a snippet to the store", () => {
      store.getState().addSnippet("Test", "Hello world");
      const snippets = store.getState().snippets;
      expect(snippets.size).toBe(1);

      const snippet = [...snippets.values()][0]!;
      expect(snippet.name).toBe("Test");
      expect(snippet.text).toBe("Hello world");
      expect(snippet.skills).toEqual(new Set());
    });

    it("seeds snippet.skills and snippetsBySkill when initial skills are provided", () => {
      const skillId = "k1";
      store.getState().addSnippet("Tagged", "text", new Set([skillId]));
      const [id, snippet] = [...store.getState().snippets.entries()][0]!;

      expect(snippet.skills.has(skillId)).toBe(true);
      expect(store.getState().snippetsBySkill.get(skillId)).toEqual(
        new Set([id]),
      );
    });
  });

  describe("updateSnippet", () => {
    it("updates snippet text", () => {
      store.getState().addSnippet("Test", "original");
      const id = [...store.getState().snippets.keys()][0]!;

      store.getState().updateSnippet(id, { text: "updated" });
      expect(store.getState().snippets.get(id)?.text).toBe("updated");
    });

    it("updates snippet name", () => {
      store.getState().addSnippet("Old", "text");
      const id = [...store.getState().snippets.keys()][0]!;

      store.getState().updateSnippet(id, { name: "New" });
      expect(store.getState().snippets.get(id)?.name).toBe("New");
    });
  });

  describe("deleteSnippet", () => {
    it("removes snippet from store", () => {
      store.getState().addSnippet("Test", "text");
      const id = [...store.getState().snippets.keys()][0]!;

      store.getState().deleteSnippet(id);
      expect(store.getState().snippets.size).toBe(0);
    });

    it("cascades to snippetsBySkill index", () => {
      store.getState().addSnippet("Test", "text");
      const id = [...store.getState().snippets.keys()][0]!;

      // Manually wire up the snippet's skills and the index
      store.setState((s) => ({
        snippetsBySkill: new Map([["skill1", new Set([id])]]),
        snippets: new Map([
          [id, { ...s.snippets.get(id)!, skills: new Set(["skill1"]) }],
        ]),
      }));
      expect(store.getState().snippetsBySkill.get("skill1")?.has(id)).toBe(
        true,
      );

      // Delete the snippet
      store.getState().deleteSnippet(id);
      expect(store.getState().snippetsBySkill.has("skill1")).toBe(false);
    });

    it("cascades to agents activeSet", () => {
      store.getState().addSnippet("Test", "text");
      const snippetId = [...store.getState().snippets.keys()][0]!;

      // Manually add an agent with this snippet active
      const agentId = "agent1";
      store.setState({
        agents: new Map([
          [
            agentId,
            {
              id: agentId,
              name: "Agent",
              activeSet: new Set([snippetId]),
            },
          ],
        ]),
      });

      store.getState().deleteSnippet(snippetId);
      const agent = store.getState().agents.get(agentId);
      expect(agent?.activeSet.has(snippetId)).toBe(false);
    });

    it("cascades to multiple agents' activeSets", () => {
      store.getState().addSnippet("Test", "text");
      const snippetId = [...store.getState().snippets.keys()][0]!;

      store.setState({
        agents: new Map([
          ["a1", { id: "a1", name: "A1", activeSet: new Set([snippetId]) }],
          ["a2", { id: "a2", name: "A2", activeSet: new Set([snippetId]) }],
        ]),
      });

      store.getState().deleteSnippet(snippetId);
      expect(store.getState().agents.get("a1")?.activeSet.has(snippetId)).toBe(
        false,
      );
      expect(store.getState().agents.get("a2")?.activeSet.has(snippetId)).toBe(
        false,
      );
    });

    it("no-ops for non-existent snippet", () => {
      store.getState().deleteSnippet("nonexistent");
      expect(store.getState().snippets.size).toBe(0);
    });
  });
});

describe("addSkillToSnippet / removeSkillFromSnippet", () => {
  let tagStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    tagStore = createTestStore(createSnippetsSlice);
  });

  describe("addSkillToSnippet", () => {
    it("adds a skill tag to a snippet", () => {
      tagStore.getState().addSnippet("Test", "text");
      const id = [...tagStore.getState().snippets.keys()][0]!;

      tagStore.getState().addSkillToSnippet(id, "skill1");
      expect(tagStore.getState().snippets.get(id)?.skills.has("skill1")).toBe(
        true,
      );
    });

    it("updates snippetsBySkill index", () => {
      tagStore.getState().addSnippet("Test", "text");
      const id = [...tagStore.getState().snippets.keys()][0]!;

      tagStore.getState().addSkillToSnippet(id, "skill1");
      expect(tagStore.getState().snippetsBySkill.get("skill1")).toEqual(
        new Set([id]),
      );
    });

    it("is idempotent", () => {
      tagStore.getState().addSnippet("Test", "text");
      const id = [...tagStore.getState().snippets.keys()][0]!;

      tagStore.getState().addSkillToSnippet(id, "skill1");
      tagStore.getState().addSkillToSnippet(id, "skill1");
      expect(tagStore.getState().snippetsBySkill.get("skill1")?.size).toBe(1);
    });
  });

  describe("removeSkillFromSnippet", () => {
    it("removes a skill tag from a snippet", () => {
      tagStore.getState().addSnippet("Test", "text");
      const id = [...tagStore.getState().snippets.keys()][0]!;

      tagStore.getState().addSkillToSnippet(id, "skill1");
      tagStore.getState().removeSkillFromSnippet(id, "skill1");
      expect(tagStore.getState().snippets.get(id)?.skills.has("skill1")).toBe(
        false,
      );
    });

    it("updates snippetsBySkill index", () => {
      tagStore.getState().addSnippet("Test", "text");
      const id = [...tagStore.getState().snippets.keys()][0]!;

      tagStore.getState().addSkillToSnippet(id, "skill1");
      tagStore.getState().removeSkillFromSnippet(id, "skill1");
      expect(tagStore.getState().snippetsBySkill.has("skill1")).toBe(false);
    });

    it("keeps the index entry when another snippet still uses the same skill", () => {
      tagStore.getState().addSnippet("S1", "text1");
      tagStore.getState().addSnippet("S2", "text2");
      const [id1, id2] = [...tagStore.getState().snippets.keys()];

      tagStore.getState().addSkillToSnippet(id1!, "skill1");
      tagStore.getState().addSkillToSnippet(id2!, "skill1");

      tagStore.getState().removeSkillFromSnippet(id1!, "skill1");

      // skill1 index entry must still exist because id2 still uses it
      expect(tagStore.getState().snippetsBySkill.get("skill1")).toEqual(
        new Set([id2]),
      );
    });

    it("no-ops when tag not present", () => {
      tagStore.getState().addSnippet("Test", "text");
      const id = [...tagStore.getState().snippets.keys()][0]!;

      tagStore.getState().removeSkillFromSnippet(id, "nonexistent");
      expect(tagStore.getState().snippets.get(id)?.skills.size).toBe(0);
    });
  });
});

describe("snippet selectors", () => {
  const s1: Snippet = {
    id: "s1",
    name: "Banana",
    text: "T1",
    skills: new Set(["k1"]),
  };
  const s2: Snippet = {
    id: "s2",
    name: "Apple",
    text: "T2",
    skills: new Set(),
  };
  const s3: Snippet = {
    id: "s3",
    name: "Cherry",
    text: "T3",
    skills: new Set(),
  };

  const state = {
    snippets: new Map([
      ["s1", s1],
      ["s2", s2],
      ["s3", s3],
    ]),
    skills: new Map(),
    agents: new Map(),
    snippetsBySkill: new Map(),
  } as StoreState;

  describe("selectUntaggedSnippets", () => {
    it("returns only snippets with no skills, sorted by name", () => {
      const result = selectUntaggedSnippets(state);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(s2); // Apple
      expect(result[1]).toBe(s3); // Cherry
    });

    it("excludes snippets that have skills", () => {
      const result = selectUntaggedSnippets(state);
      expect(result.find((s) => s.id === "s1")).toBeUndefined();
    });
  });

  describe("selectAllSnippets", () => {
    it("returns all snippets sorted alphabetically by name", () => {
      const result = selectAllSnippets(state);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(s2); // Apple
      expect(result[1]).toBe(s1); // Banana
      expect(result[2]).toBe(s3); // Cherry
    });
  });

  describe("selectSnippetsForSkill", () => {
    const stateWithIndex: StoreState = {
      ...state,
      snippetsBySkill: new Map([["k1", new Set(["s1"])]]),
    };

    it("returns snippets tagged with the given skill, sorted by name", () => {
      const result = selectSnippetsForSkill(stateWithIndex, "k1");
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(s1);
    });

    it("returns empty array for a skill that has no tagged snippets", () => {
      expect(selectSnippetsForSkill(state, "k1")).toHaveLength(0);
    });

    it("returns empty array for an unknown skill ID", () => {
      expect(selectSnippetsForSkill(state, "nonexistent")).toHaveLength(0);
    });

    it("returns multiple snippets sorted alphabetically by name", () => {
      const s4: Snippet = {
        id: "s4",
        name: "Avocado",
        text: "T4",
        skills: new Set(["k1"]),
      };
      const multiState: StoreState = {
        ...state,
        snippets: new Map([
          ["s1", s1],
          ["s4", s4],
        ]),
        snippetsBySkill: new Map([["k1", new Set(["s1", "s4"])]]),
      };
      const result = selectSnippetsForSkill(multiState, "k1");
      expect(result[0]).toBe(s4); // Avocado before Banana
      expect(result[1]).toBe(s1);
    });
  });

  describe("selectUntaggedSnippetCount", () => {
    const agent = {
      id: "a1",
      name: "Agent",
      activeSet: new Set(["s2"]),
    };

    it("returns active=0 when no agent is selected", () => {
      const result = selectUntaggedSnippetCount({
        ...state,
        activeAgentId: null,
      });
      expect(result).toEqual({ active: 0, total: 2 });
    });

    it("returns total=0, active=0 when all snippets are tagged", () => {
      const allTaggedState = {
        ...state,
        activeAgentId: "a1",
        snippets: new Map([["s1", s1]]),
        agents: new Map([["a1", agent]]),
      } as StoreState;
      const result = selectUntaggedSnippetCount(allTaggedState);
      expect(result).toEqual({ active: 0, total: 0 });
    });

    it("returns correct total with no active untagged snippets", () => {
      const noActiveState = {
        ...state,
        activeAgentId: "a1",
        agents: new Map([["a1", { ...agent, activeSet: new Set<string>() }]]),
      } as StoreState;
      const result = selectUntaggedSnippetCount(noActiveState);
      expect(result).toEqual({ active: 0, total: 2 });
    });

    it("returns correct partial active count for untagged snippets", () => {
      const partialState = {
        ...state,
        activeAgentId: "a1",
        agents: new Map([["a1", agent]]),
      } as StoreState;
      const result = selectUntaggedSnippetCount(partialState);
      // s2 and s3 are untagged; only s2 is active
      expect(result).toEqual({ active: 1, total: 2 });
    });
  });
});
