import { describe, it, expect, beforeEach } from "vitest";
import { createDataControlsSlice } from "@/store/useDataControls";
import type { AppState, Snippet } from "@/types";
import { createTestStore } from "@/store/tests/testUtils";

describe("createDataControlsSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore(createDataControlsSlice);
  });

  it("saves live state to baseline", () => {
    const snippet: Snippet = {
      id: "s1",
      name: "S1",
      text: "T1",
      skills: new Set(),
    };
    store.setState({
      snippets: new Map([["s1", snippet]]),
    });

    store.getState().saveSession();
    expect(store.getState().baseline.snippets.get("s1")).toEqual(snippet);
  });

  it("discards live state and reverts to baseline", () => {
    const snippet: Snippet = {
      id: "s1",
      name: "S1",
      text: "T1",
      skills: new Set(),
    };
    store.setState({
      baseline: {
        snippets: new Map([["s1", snippet]]),
        skills: new Map(),
        agents: new Map(),
      },
      snippets: new Map(),
      skills: new Map(),
      agents: new Map(),
    });

    store.getState().discardSession();
    expect(store.getState().snippets.get("s1")).toEqual(snippet);
  });

  it("rebuilds index on discard", () => {
    const snippet: Snippet = {
      id: "s1",
      name: "S1",
      text: "T1",
      skills: new Set(["skill1"]),
    };
    store.setState({
      baseline: {
        snippets: new Map([["s1", snippet]]),
        skills: new Map(),
        agents: new Map(),
      },
      snippets: new Map(),
      skills: new Map(),
      agents: new Map(),
      snippetsBySkill: new Map(),
    });

    store.getState().discardSession();
    expect(store.getState().snippetsBySkill.get("skill1")).toEqual(
      new Set(["s1"]),
    );
  });

  it("ensures structuredClone independence", () => {
    const snippet: Snippet = {
      id: "s1",
      name: "S1",
      text: "T1",
      skills: new Set(),
    };
    store.setState({
      snippets: new Map([["s1", snippet]]),
    });

    store.getState().saveSession();

    // Override live state to verify baseline is an independent clone
    store.setState({
      snippets: new Map([["s1", { ...snippet, name: "Mutated" }]]),
    });

    expect(store.getState().baseline.snippets.get("s1")?.name).toBe("S1");
  });

  describe("importState", () => {
    const serialized: AppState = {
      snippets: {
        s1: { id: "s1", name: "Snippet 1", text: "Hello", skills: ["sk1"] },
      },
      skills: {
        sk1: { id: "sk1", name: "Skill 1" },
      },
      agents: {
        a1: {
          id: "a1",
          name: "Agent 1",
          activeSet: ["s1"],
        },
      },
      outputSettings: { theme: "dark" },
    };

    it("deserializes snippets with Set skills", () => {
      store.getState().importState(serialized);
      const snippet = store.getState().snippets.get("s1");
      expect(snippet?.skills).toBeInstanceOf(Set);
      expect(snippet?.skills.has("sk1")).toBe(true);
    });

    it("deserializes agents with Set activeSet", () => {
      store.getState().importState(serialized);
      const agent = store.getState().agents.get("a1");
      expect(agent?.activeSet).toBeInstanceOf(Set);
      expect(agent?.activeSet.has("s1")).toBe(true);
    });

    it("rebuilds snippetsBySkill index", () => {
      store.getState().importState(serialized);
      expect(store.getState().snippetsBySkill.get("sk1")).toEqual(
        new Set(["s1"]),
      );
    });

    it("resets selection state", () => {
      store.setState({
        activeAgentId: "old-agent",
        activeSkillId: "old-skill",
      });
      store.getState().importState(serialized);
      expect(store.getState().activeAgentId).toBe("a1");
      expect(store.getState().activeSkillId).toBeNull();
    });

    it("sets outputSettings from imported data", () => {
      store.getState().importState(serialized);
      expect(store.getState().outputSettings.theme).toBe("dark");
    });

    it("populates both baseline and live state identically", () => {
      store.getState().importState(serialized);
      expect(store.getState().baseline.snippets.get("s1")).toEqual(
        store.getState().snippets.get("s1"),
      );
    });

    it("makes baseline and live state independent copies", () => {
      store.getState().importState(serialized);
      const original = store.getState().snippets.get("s1")!;
      // Override live state to verify baseline is an independent copy
      store.setState({
        snippets: new Map([["s1", { ...original, name: "Mutated" }]]),
      });
      expect(store.getState().baseline.snippets.get("s1")?.name).toBe(
        "Snippet 1",
      );
    });
  });

  describe("clearData", () => {
    it("empties snippets, skills, and agents", () => {
      const snippet: Snippet = {
        id: "s1",
        name: "S1",
        text: "T1",
        skills: new Set(),
      };
      store.setState({
        baseline: {
          snippets: new Map([["s1", snippet]]),
          skills: new Map(),
          agents: new Map(),
        },
        snippets: new Map([["s1", snippet]]),
        skills: new Map(),
        agents: new Map(),
      });

      store.getState().clearData();

      expect(store.getState().snippets.size).toBe(0);
      expect(store.getState().baseline.snippets.size).toBe(0);
    });

    it("clears snippetsBySkill index", () => {
      store.setState({ snippetsBySkill: new Map([["sk1", new Set(["s1"])]]) });
      store.getState().clearData();
      expect(store.getState().snippetsBySkill.size).toBe(0);
    });

    it("resets selection state", () => {
      store.setState({ activeAgentId: "agent-1", activeSkillId: "skill-1" });
      store.getState().clearData();
      expect(store.getState().activeAgentId).toBeNull();
      expect(store.getState().activeSkillId).toBeNull();
    });

    it("resets outputSettings to default", () => {
      store.setState({ outputSettings: { theme: "dark" } });
      store.getState().clearData();
      expect(store.getState().outputSettings.theme).toBe("light");
    });
  });
});
