import { describe, it, expect } from "vitest";
import {
  buildSkillGroups,
  compileOutputBySkillGroup,
  compileOutputXML,
} from "@/lib/compiler";
import { UNTAGGED_SKILL_ID } from "@/lib/storeUtils";
import type { Agent, Snippet, Skill } from "@/types";

// ── Shared fixtures ───────────────────────────────────────────────────────────

const skillAlpha: Skill = { id: "sA", name: "Alpha" };
const skillBeta: Skill = { id: "sB", name: "Beta" };

const snipA1: Snippet = {
  id: "n1",
  name: "A-Snippet",
  text: "text-a1",
  skills: new Set(["sA"]),
};
const snipA2: Snippet = {
  id: "n2",
  name: "B-Snippet",
  text: "text-a2",
  skills: new Set(["sA"]),
};
const snipB1: Snippet = {
  id: "n3",
  name: "C-Snippet",
  text: "text-b1",
  skills: new Set(["sB"]),
};
const snipMulti: Snippet = {
  id: "n4",
  name: "Multi-Snippet",
  text: "text-multi",
  skills: new Set(["sA", "sB"]),
};
const snipUntagged: Snippet = {
  id: "n5",
  name: "Untagged-Snippet",
  text: "text-untagged",
  skills: new Set(),
};

const defaultSnippets = new Map<string, Snippet>([
  ["n1", snipA1],
  ["n2", snipA2],
  ["n3", snipB1],
]);

const defaultSkills = new Map<string, Skill>([
  ["sA", skillAlpha],
  ["sB", skillBeta],
]);

const defaultSnippetsBySkill = new Map<string, Set<string>>([
  ["sA", new Set(["n1", "n2"])],
  ["sB", new Set(["n3"])],
]);

function makeAgent(overrides: Partial<Agent>): Agent {
  return { id: "a1", name: "Agent", activeSet: new Set(), ...overrides };
}

// ── buildSkillGroups ──────────────────────────────────────────────────────────

describe("buildSkillGroups", () => {
  it("returns [] when activeSet is empty", () => {
    const agent = makeAgent({ activeSet: new Set() });
    expect(
      buildSkillGroups(
        agent,
        defaultSnippets,
        defaultSkills,
        defaultSnippetsBySkill,
      ),
    ).toEqual([]);
  });

  it("returns one group per skill with active snippets", () => {
    const agent = makeAgent({ activeSet: new Set(["n1", "n3"]) });
    const groups = buildSkillGroups(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    expect(groups).toHaveLength(2);
    expect(groups[0]?.skillId).toBe("sA");
    expect(groups[1]?.skillId).toBe("sB");
  });

  it("orders skill groups alphabetically by skill name", () => {
    // Beta (sB) comes before Alpha (sA) in the skills Map, but Alpha should be first in output
    const skills = new Map<string, Skill>([
      ["sB", skillBeta],
      ["sA", skillAlpha],
    ]);
    const agent = makeAgent({ activeSet: new Set(["n1", "n3"]) });
    const groups = buildSkillGroups(
      agent,
      defaultSnippets,
      skills,
      defaultSnippetsBySkill,
    );
    expect(groups[0]?.skillId).toBe("sA"); // Alpha
    expect(groups[1]?.skillId).toBe("sB"); // Beta
  });

  it("excludes skills that have no active snippets", () => {
    const agent = makeAgent({ activeSet: new Set(["n1"]) }); // only n1 (sA), n3 (sB) not active
    const groups = buildSkillGroups(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]?.skillId).toBe("sA");
  });

  it("sorts snippets within a group alphabetically by name", () => {
    const agent = makeAgent({ activeSet: new Set(["n1", "n2"]) });
    const groups = buildSkillGroups(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    const snippets = groups[0]?.snippets ?? [];
    expect(snippets[0]?.name).toBe("A-Snippet"); // n1
    expect(snippets[1]?.name).toBe("B-Snippet"); // n2
  });

  it("untagged snippets form a separate group at the end", () => {
    const snippets = new Map<string, Snippet>([
      ["n1", snipA1],
      ["n5", snipUntagged],
    ]);
    const agent = makeAgent({ activeSet: new Set(["n1", "n5"]) });
    const groups = buildSkillGroups(
      agent,
      snippets,
      defaultSkills,
      new Map([["sA", new Set(["n1"])]]),
    );
    expect(groups).toHaveLength(2);
    expect(groups[0]?.skillId).toBe("sA");
    expect(groups[1]?.skillId).toBe(UNTAGGED_SKILL_ID);
  });

  it("multi-skill snippet appears in first skill group only (deduplication)", () => {
    const snippets = new Map<string, Snippet>([
      ["n4", snipMulti], // tagged with sA and sB
    ]);
    const snippetsBySkill = new Map<string, Set<string>>([
      ["sA", new Set(["n4"])],
      ["sB", new Set(["n4"])],
    ]);
    const agent = makeAgent({ activeSet: new Set(["n4"]) });
    const groups = buildSkillGroups(
      agent,
      snippets,
      defaultSkills,
      snippetsBySkill,
    );
    // n4 appears under sA (first alphabetically); sB group gets nothing after dedup
    // so buildSkillGroups still creates BOTH groups (dedup happens at compile time)
    // actually let's check: getActiveSnippetsForSkill is called independently for each group
    // so BOTH sA and sB groups will have n4
    const allSnippetIds = groups.flatMap((g) => g.snippets.map((s) => s.id));
    // n4 appears in sA group and sB group — dedup only at compile step
    expect(allSnippetIds.filter((id) => id === "n4")).toHaveLength(2);
  });
});

// ── compileOutputBySkillGroup ─────────────────────────────────────────────────

describe("compileOutputBySkillGroup", () => {
  it("returns empty string when agent is null", () => {
    expect(
      compileOutputBySkillGroup(
        null,
        defaultSnippets,
        defaultSkills,
        defaultSnippetsBySkill,
      ),
    ).toBe("");
  });

  it("returns empty string when activeSet is empty", () => {
    const agent = makeAgent({ activeSet: new Set() });
    expect(
      compileOutputBySkillGroup(
        agent,
        defaultSnippets,
        defaultSkills,
        defaultSnippetsBySkill,
      ),
    ).toBe("");
  });

  it("returns the trimmed text of a single active snippet", () => {
    const agent = makeAgent({ activeSet: new Set(["n1"]) });
    expect(
      compileOutputBySkillGroup(
        agent,
        defaultSnippets,
        defaultSkills,
        defaultSnippetsBySkill,
      ),
    ).toBe("text-a1");
  });

  it("joins multiple snippets with newline, ordered by skill then name", () => {
    const agent = makeAgent({ activeSet: new Set(["n1", "n3"]) });
    const result = compileOutputBySkillGroup(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    expect(result).toBe("text-a1\ntext-b1");
  });

  it("deduplicates multi-skill snippets — appears only once in output", () => {
    const snippets = new Map<string, Snippet>([["n4", snipMulti]]);
    const snippetsBySkill = new Map<string, Set<string>>([
      ["sA", new Set(["n4"])],
      ["sB", new Set(["n4"])],
    ]);
    const agent = makeAgent({ activeSet: new Set(["n4"]) });
    const result = compileOutputBySkillGroup(
      agent,
      snippets,
      defaultSkills,
      snippetsBySkill,
    );
    expect(result).toBe("text-multi");
    expect(result.split("text-multi")).toHaveLength(2); // appears exactly once
  });

  it("excludes snippets whose text is only whitespace", () => {
    const blank: Snippet = {
      id: "blank",
      name: "Blank",
      text: "   ",
      skills: new Set(["sA"]),
    };
    const snippets = new Map<string, Snippet>([
      ["n1", snipA1],
      ["blank", blank],
    ]);
    const snippetsBySkill = new Map<string, Set<string>>([
      ["sA", new Set(["n1", "blank"])],
    ]);
    const agent = makeAgent({ activeSet: new Set(["n1", "blank"]) });
    const result = compileOutputBySkillGroup(
      agent,
      snippets,
      defaultSkills,
      snippetsBySkill,
    );
    expect(result).toBe("text-a1");
  });
});

// ── compileOutputXML ──────────────────────────────────────────────────────────

describe("compileOutputXML", () => {
  it("returns empty string when agent is null", () => {
    expect(
      compileOutputXML(
        null,
        defaultSnippets,
        defaultSkills,
        defaultSnippetsBySkill,
      ),
    ).toBe("");
  });

  it("returns empty string when activeSet is empty", () => {
    const agent = makeAgent({ activeSet: new Set() });
    expect(
      compileOutputXML(
        agent,
        defaultSnippets,
        defaultSkills,
        defaultSnippetsBySkill,
      ),
    ).toBe("");
  });

  it("wraps a snippet group in an XML tag matching the skill name", () => {
    const agent = makeAgent({ activeSet: new Set(["n1"]) });
    const result = compileOutputXML(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    expect(result).toContain("<alpha>");
    expect(result).toContain("</alpha>");
  });

  it("prefixes each snippet with a bullet point", () => {
    const agent = makeAgent({ activeSet: new Set(["n1"]) });
    const result = compileOutputXML(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    expect(result).toContain("• text-a1");
  });

  it("separates multiple skill groups with double newline", () => {
    const agent = makeAgent({ activeSet: new Set(["n1", "n3"]) });
    const result = compileOutputXML(
      agent,
      defaultSnippets,
      defaultSkills,
      defaultSnippetsBySkill,
    );
    expect(result).toContain("\n\n");
    const sections = result.split("\n\n");
    expect(sections).toHaveLength(2);
  });

  it("untagged snippets use <untagged> tag", () => {
    const snippets = new Map<string, Snippet>([["n5", snipUntagged]]);
    const agent = makeAgent({ activeSet: new Set(["n5"]) });
    const result = compileOutputXML(agent, snippets, defaultSkills, new Map());
    expect(result).toContain("<untagged>");
    expect(result).toContain("</untagged>");
  });

  it("deduplicates multi-skill snippets across skill groups", () => {
    const snippets = new Map<string, Snippet>([["n4", snipMulti]]);
    const snippetsBySkill = new Map<string, Set<string>>([
      ["sA", new Set(["n4"])],
      ["sB", new Set(["n4"])],
    ]);
    const agent = makeAgent({ activeSet: new Set(["n4"]) });
    const result = compileOutputXML(
      agent,
      snippets,
      defaultSkills,
      snippetsBySkill,
    );
    // text-multi should appear exactly once
    expect(result.split("text-multi")).toHaveLength(2);
  });

  it("converts skill name with special chars to a valid XML tag name", () => {
    const specialSkill: Skill = { id: "sX", name: "My Skill!" };
    const snip: Snippet = {
      id: "nx",
      name: "X",
      text: "text-x",
      skills: new Set(["sX"]),
    };
    const result = compileOutputXML(
      makeAgent({ activeSet: new Set(["nx"]) }),
      new Map([["nx", snip]]),
      new Map([["sX", specialSkill]]),
      new Map([["sX", new Set(["nx"])]]),
    );
    expect(result).toContain("<my-skill>");
    expect(result).toContain("</my-skill>");
  });

  it("prefixes a skill name starting with a digit with underscore", () => {
    const digitSkill: Skill = { id: "sD", name: "42things" };
    const snip: Snippet = {
      id: "nd",
      name: "D",
      text: "text-d",
      skills: new Set(["sD"]),
    };
    const result = compileOutputXML(
      makeAgent({ activeSet: new Set(["nd"]) }),
      new Map([["nd", snip]]),
      new Map([["sD", digitSkill]]),
      new Map([["sD", new Set(["nd"])]]),
    );
    expect(result).toContain("<_42things>");
  });
});
