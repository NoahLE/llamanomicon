import { describe, it, expect, beforeEach } from "vitest";
import {
  createSkillsSlice,
  selectSortedSkills,
  UNTAGGED_SKILL_ID,
} from "@/store/useSkills";
import { selectSnippetsForSkill } from "@/store/useSnippets";
import { selectSnippetCountForSkill } from "@/store/useSkills";
import { createAgentsSlice } from "@/store/useAgents";
import { createAgentsSnippetsSlice } from "@/store/useAgentSnippets";
import type { Skill, Snippet } from "@/types";
import { createTestStore } from "@/store/tests/testUtils";
import type { StoreState } from "@/store/useAppStore";

describe("createSkillsSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore(createSkillsSlice);
  });

  describe("initial state", () => {
    it("initializes activeSkillId to UNTAGGED_SKILL_ID", () => {
      expect(store.getState().activeSkillId).toBe(UNTAGGED_SKILL_ID);
    });
  });

  describe("addSkill", () => {
    it("adds a skill to the store", () => {
      store.getState().addSkill("Test Skill");
      const skills = store.getState().skills;
      expect(skills.size).toBe(1);

      const skill = [...skills.values()][0]!;
      expect(skill.name).toBe("Test Skill");
    });
  });

  describe("updateSkill", () => {
    it("updates skill name", () => {
      store.getState().addSkill("Old Name");
      const id = [...store.getState().skills.keys()][0]!;

      store.getState().updateSkill(id, { name: "New Name" });
      expect(store.getState().skills.get(id)?.name).toBe("New Name");
    });
  });

  describe("deleteSkill", () => {
    it("removes skill from store", () => {
      store.getState().addSkill("To Delete");
      const id = [...store.getState().skills.keys()][0]!;

      store.getState().deleteSkill(id);
      expect(store.getState().skills.size).toBe(0);
    });

    it("resets activeSkillId if it was the deleted skill", () => {
      store.getState().addSkill("Target");
      const id = [...store.getState().skills.keys()][0]!;
      store.getState().setActiveSkillId(id);
      expect(store.getState().activeSkillId).toBe(id);

      store.getState().deleteSkill(id);
      expect(store.getState().activeSkillId).toBe(UNTAGGED_SKILL_ID);
    });

    it("cascades to snippets: removes skill from all snippets", () => {
      store.getState().addSkill("Skill 1");
      const skillId = [...store.getState().skills.keys()][0]!;

      // Setup a snippet with this skill
      const snippetId = "snip1";
      const snippet: Snippet = {
        id: snippetId,
        name: "Snippet 1",
        text: "content",
        skills: new Set([skillId]),
      };

      store.setState({
        snippets: new Map([[snippetId, snippet]]),
      });

      store.getState().deleteSkill(skillId);

      const updatedSnippet = store.getState().snippets.get(snippetId);
      expect(updatedSnippet?.skills.has(skillId)).toBe(false);
    });

    it("cascades to snippetsBySkill index: removes the skill entry", () => {
      store.getState().addSkill("Skill 1");
      const realId = [...store.getState().skills.keys()][0]!;

      store.setState({
        snippetsBySkill: new Map([[realId, new Set(["snip1"])]]),
      });

      store.getState().deleteSkill(realId);
      expect(store.getState().snippetsBySkill.has(realId)).toBe(false);
    });

    it("does not reset activeSkillId when a different skill is deleted", () => {
      store.getState().addSkill("Skill A");
      store.getState().addSkill("Skill B");
      const [idA, idB] = [...store.getState().skills.keys()];

      store.getState().setActiveSkillId(idA!);
      store.getState().deleteSkill(idB!);

      expect(store.getState().activeSkillId).toBe(idA);
    });

    it("cascades to multiple snippets that share the deleted skill", () => {
      store.getState().addSkill("Shared");
      const skillId = [...store.getState().skills.keys()][0]!;

      const snippet1: Snippet = {
        id: "snip1",
        name: "S1",
        text: "t",
        skills: new Set([skillId]),
      };
      const snippet2: Snippet = {
        id: "snip2",
        name: "S2",
        text: "t",
        skills: new Set([skillId]),
      };
      store.setState({
        snippets: new Map([
          ["snip1", snippet1],
          ["snip2", snippet2],
        ]),
      });

      store.getState().deleteSkill(skillId);

      expect(store.getState().snippets.get("snip1")?.skills.has(skillId)).toBe(
        false,
      );
      expect(store.getState().snippets.get("snip2")?.skills.has(skillId)).toBe(
        false,
      );
    });
  });

  describe("setActiveSkillId", () => {
    it("sets the active skill ID", () => {
      store.getState().setActiveSkillId("skill-abc");
      expect(store.getState().activeSkillId).toBe("skill-abc");

      store.getState().setActiveSkillId(null);
      expect(store.getState().activeSkillId).toBe(null);
    });
  });
});

describe("skill selectors", () => {
  const k1: Skill = { id: "k1", name: "Z-Skill" };
  const k2: Skill = { id: "k2", name: "A-Skill" };
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

  const state = {
    skills: new Map([
      ["k1", k1],
      ["k2", k2],
    ]),
    snippets: new Map([
      ["s1", s1],
      ["s2", s2],
    ]),
    agents: new Map(),
    snippetsBySkill: new Map([["k1", new Set(["s1"])]]),
    activeSkillId: "k1",
  } as StoreState;

  describe("UNTAGGED_SKILL_ID", () => {
    it("has the expected virtual ID value", () => {
      expect(UNTAGGED_SKILL_ID).toBe("__untagged__");
    });
  });

  describe("selectSortedSkills", () => {
    it("returns all skills sorted alphabetically by name", () => {
      const sorted = selectSortedSkills(state);
      expect(sorted[0]).toBe(k2); // A-Skill
      expect(sorted[1]).toBe(k1); // Z-Skill
    });
  });

  describe("selectSnippetsForSkill", () => {
    it("returns snippets tagged with the given skill", () => {
      const snippets = selectSnippetsForSkill(state, "k1");
      expect(snippets).toHaveLength(1);
      expect(snippets[0]).toBe(s1);
    });

    it("returns empty array for a skill with no snippets", () => {
      expect(selectSnippetsForSkill(state, "k2")).toHaveLength(0);
    });

    it("returns empty array for an unknown skill ID", () => {
      expect(selectSnippetsForSkill(state, "unknown")).toHaveLength(0);
    });
  });

  describe("selectSnippetCountForSkill", () => {
    const agent = {
      id: "a1",
      name: "Agent",
      activeSet: new Set(["s1"]),
    };

    const stateWithAgent = {
      ...state,
      activeAgentId: "a1",
      agents: new Map([["a1", agent]]),
    } as StoreState;

    it("returns active=0, total=N when no agent is selected", () => {
      const result = selectSnippetCountForSkill(
        { ...state, activeAgentId: null },
        "k1",
      );
      expect(result).toEqual({ active: 0, total: 1 });
    });

    it("returns active=0 when agent has no active snippets for skill", () => {
      const stateNoActive = {
        ...stateWithAgent,
        agents: new Map([["a1", { ...agent, activeSet: new Set<string>() }]]),
      };
      const result = selectSnippetCountForSkill(stateNoActive, "k1");
      expect(result).toEqual({ active: 0, total: 1 });
    });

    it("returns partial active count when some snippets are active", () => {
      const s2Tagged: Snippet = {
        id: "s2t",
        name: "S2T",
        text: "T",
        skills: new Set(["k1"]),
      };
      const statePartial = {
        ...stateWithAgent,
        snippets: new Map([
          ["s1", s1],
          ["s2t", s2Tagged],
        ]),
        snippetsBySkill: new Map([["k1", new Set(["s1", "s2t"])]]),
      };
      const result = selectSnippetCountForSkill(statePartial, "k1");
      expect(result).toEqual({ active: 1, total: 2 });
    });

    it("returns active=N/total=N when all snippets are active", () => {
      const result = selectSnippetCountForSkill(stateWithAgent, "k1");
      expect(result).toEqual({ active: 1, total: 1 });
    });

    it("returns 0/0 for a skill with zero tagged snippets", () => {
      const result = selectSnippetCountForSkill(stateWithAgent, "k2");
      expect(result).toEqual({ active: 0, total: 0 });
    });
  });
});

describe("selectSnippetCountForSkill reactivity (US2)", () => {
  it("increments active count after activateSnippet and decrements after deactivateSnippet", () => {
    const store = createTestStore((set, get, api) => ({
      ...createAgentsSlice(set, get, api),
      ...createAgentsSnippetsSlice(set, get, api),
    }));
    store.setState({
      skills: new Map([["k1", { id: "k1", name: "K1" }]]),
      snippets: new Map([
        ["s1", { id: "s1", name: "S1", text: "T", skills: new Set(["k1"]) }],
      ]),
      agents: new Map([
        [
          "a1",
          {
            id: "a1",
            name: "Agent",
            activeSet: new Set(),
          },
        ],
      ]),
      snippetsBySkill: new Map([["k1", new Set(["s1"])]]),
      activeAgentId: "a1",
    });

    expect(selectSnippetCountForSkill(store.getState(), "k1")).toEqual({
      active: 0,
      total: 1,
    });

    store.getState().activateSnippet("a1", "s1");
    expect(selectSnippetCountForSkill(store.getState(), "k1")).toEqual({
      active: 1,
      total: 1,
    });

    store.getState().deactivateSnippet("a1", "s1");
    expect(selectSnippetCountForSkill(store.getState(), "k1")).toEqual({
      active: 0,
      total: 1,
    });
  });
});

describe("selectSnippetCountForSkill agent switching (US3)", () => {
  it("returns correct counts when switching between agents with different active sets", () => {
    const store = createTestStore((set, get, api) => ({
      ...createAgentsSlice(set, get, api),
      ...createAgentsSnippetsSlice(set, get, api),
    }));
    store.setState({
      skills: new Map([["k1", { id: "k1", name: "K1" }]]),
      snippets: new Map([
        ["s1", { id: "s1", name: "S1", text: "T", skills: new Set(["k1"]) }],
        ["s2", { id: "s2", name: "S2", text: "T", skills: new Set(["k1"]) }],
      ]),
      agents: new Map([
        [
          "a1",
          {
            id: "a1",
            name: "AgentA",
            activeSet: new Set(["s1", "s2"]),
          },
        ],
        [
          "b1",
          {
            id: "b1",
            name: "AgentB",
            activeSet: new Set(),
          },
        ],
      ]),
      snippetsBySkill: new Map([["k1", new Set(["s1", "s2"])]]),
      activeAgentId: "a1",
    });

    expect(selectSnippetCountForSkill(store.getState(), "k1")).toEqual({
      active: 2,
      total: 2,
    });

    store.getState().setActiveAgentId("b1");
    expect(selectSnippetCountForSkill(store.getState(), "k1")).toEqual({
      active: 0,
      total: 2,
    });

    store.getState().setActiveAgentId("a1");
    expect(selectSnippetCountForSkill(store.getState(), "k1")).toEqual({
      active: 2,
      total: 2,
    });
  });
});
