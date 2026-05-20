import { describe, it, expect, beforeEach } from "vitest";
import {
  createSettingsSlice,
  selectCompiledOutput,
  selectCompiledOutputXML,
} from "@/store/useSettings";
import { createTestStore } from "@/store/tests/testUtils";
import type { StoreState } from "@/store/useAppStore";
import type { Agent, Skill, Snippet } from "@/types";

describe("createSettingsSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore(createSettingsSlice);
  });

  it("updates output settings", () => {
    store.getState().updateOutputSettings({ theme: "dark" });
    expect(store.getState().outputSettings.theme).toBe("dark");
  });

  it("partial patch preserves other outputSettings fields", () => {
    // theme starts as "light"; patching to "dark" should not wipe other fields
    store.getState().updateOutputSettings({ theme: "dark" });
    expect(store.getState().outputSettings.theme).toBe("dark");
    // verify the object still has the theme key after a no-op patch
    store.getState().updateOutputSettings({});
    expect(store.getState().outputSettings.theme).toBe("dark");
  });

  it("does not have showGroupHeaders", () => {
    // @ts-expect-error - testing absence of property
    expect(store.getState().outputSettings.showGroupHeaders).toBeUndefined();
  });
});

describe("selectCompiledOutput", () => {
  const s1: Snippet = {
    id: "s1",
    name: "First",
    text: "Hello",
    skills: new Set(),
  };
  const s2: Snippet = {
    id: "s2",
    name: "Second",
    text: "World",
    skills: new Set(),
  };
  const agent: Agent = {
    id: "a1",
    name: "Agent",
    activeSet: new Set(["s1"]),
  };

  const state = {
    snippets: new Map([
      ["s1", s1],
      ["s2", s2],
    ]),
    skills: new Map(),
    agents: new Map([["a1", agent]]),
    activeAgentId: "a1",
    outputSettings: { theme: "light" },
    snippetsBySkill: new Map(),
  } as StoreState;

  it("compiles the output for the active agent", () => {
    expect(selectCompiledOutput(state)).toBe("Hello");
  });

  it("returns empty string when no active agent", () => {
    expect(selectCompiledOutput({ ...state, activeAgentId: null })).toBe("");
  });

  it("joins multiple active snippets with newline separator", () => {
    const multiAgent: Agent = {
      id: "a2",
      name: "Multi",
      activeSet: new Set(["s1", "s2"]),
    };
    const multiState = {
      ...state,
      activeAgentId: "a2",
      agents: new Map([["a2", multiAgent]]),
    } as StoreState;
    expect(selectCompiledOutput(multiState)).toBe("Hello\nWorld");
  });

  it("deduplicates multi-skill snippets — snippet appears only once", () => {
    const skill: Skill = { id: "k1", name: "Writing" };
    const skill2: Skill = { id: "k2", name: "Editing" };
    const multi: Snippet = {
      id: "sm",
      name: "Multi",
      text: "Shared text",
      skills: new Set(["k1", "k2"]),
    };
    const multiAgent: Agent = {
      id: "am",
      name: "Multi",
      activeSet: new Set(["sm"]),
    };
    const multiState: StoreState = {
      ...state,
      snippets: new Map([["sm", multi]]),
      skills: new Map([
        ["k1", skill],
        ["k2", skill2],
      ]),
      agents: new Map([["am", multiAgent]]),
      activeAgentId: "am",
      snippetsBySkill: new Map([
        ["k1", new Set(["sm"])],
        ["k2", new Set(["sm"])],
      ]),
    };
    const result = selectCompiledOutput(multiState);
    expect(result).toBe("Shared text");
    expect(result.split("Shared text")).toHaveLength(2); // exactly once
  });
});

describe("selectCompiledOutputXML", () => {
  const skill: Skill = { id: "k1", name: "Coding" };
  const s1: Snippet = {
    id: "s1",
    name: "First",
    text: "fn main() {}",
    skills: new Set(["k1"]),
  };
  const untagged: Snippet = {
    id: "s2",
    name: "Bare",
    text: "bare text",
    skills: new Set(),
  };
  const agent: Agent = { id: "a1", name: "Agent", activeSet: new Set(["s1"]) };

  const baseState: StoreState = {
    snippets: new Map([["s1", s1]]),
    skills: new Map([["k1", skill]]),
    agents: new Map([["a1", agent]]),
    activeAgentId: "a1",
    outputSettings: { theme: "light" },
    snippetsBySkill: new Map([["k1", new Set(["s1"])]]),
  } as StoreState;

  it("returns empty string when no active agent", () => {
    expect(selectCompiledOutputXML({ ...baseState, activeAgentId: null })).toBe(
      "",
    );
  });

  it("returns empty string when agent has no active snippets", () => {
    const emptyAgent: Agent = { id: "a1", name: "Agent", activeSet: new Set() };
    expect(
      selectCompiledOutputXML({
        ...baseState,
        agents: new Map([["a1", emptyAgent]]),
      }),
    ).toBe("");
  });

  it("wraps snippet group in an XML tag derived from skill name", () => {
    const result = selectCompiledOutputXML(baseState);
    expect(result).toContain("<coding>");
    expect(result).toContain("</coding>");
  });

  it("prefixes each snippet text with a bullet point", () => {
    const result = selectCompiledOutputXML(baseState);
    expect(result).toContain("• fn main() {}");
  });

  it("places untagged snippets in an <untagged> group", () => {
    const stateWithUntagged: StoreState = {
      ...baseState,
      snippets: new Map([["s2", untagged]]),
      agents: new Map([["a1", { ...agent, activeSet: new Set(["s2"]) }]]),
      snippetsBySkill: new Map(),
    };
    const result = selectCompiledOutputXML(stateWithUntagged);
    expect(result).toContain("<untagged>");
    expect(result).toContain("</untagged>");
  });

  it("separates multiple skill sections with double newline", () => {
    const skill2: Skill = { id: "k2", name: "Testing" };
    const s3: Snippet = {
      id: "s3",
      name: "Test",
      text: "assert!",
      skills: new Set(["k2"]),
    };
    const multiState: StoreState = {
      ...baseState,
      snippets: new Map([
        ["s1", s1],
        ["s3", s3],
      ]),
      skills: new Map([
        ["k1", skill],
        ["k2", skill2],
      ]),
      agents: new Map([["a1", { ...agent, activeSet: new Set(["s1", "s3"]) }]]),
      snippetsBySkill: new Map([
        ["k1", new Set(["s1"])],
        ["k2", new Set(["s3"])],
      ]),
    };
    const result = selectCompiledOutputXML(multiState);
    const sections = result.split("\n\n");
    expect(sections).toHaveLength(2);
  });
});
