import type { StateCreator } from "zustand";

import type { Agent, Snippet } from "@/types";
import { sortByName, UNTAGGED_SKILL_ID } from "@/lib/storeUtils";
import { buildSkillGroups } from "@/lib/compiler";
import type { StoreState } from "@/store/useAppStore";

export interface SkillGroup {
  skillId: string;
  skillName: string;
  snippets: Snippet[];
}

// Input-aware memoization: only recomputes when the active agent object or
// the data maps it reads actually change. Unrelated mutations (e.g.,
// outputSettings, activeSkillId) do not bust the cache.
let _memoAgent: Agent | null = null;
let _memoSnippets: StoreState["snippets"] | null = null;
let _memoSkills: StoreState["skills"] | null = null;
let _memoSnippetsBySkill: StoreState["snippetsBySkill"] | null = null;
let _memoResult: SkillGroup[] = [];

export const selectSkillGroupsForOutput = (
  storeState: StoreState,
): SkillGroup[] => {
  const agent = selectActiveAgent(storeState);
  const { snippets, skills, snippetsBySkill } = storeState;

  if (
    agent === _memoAgent &&
    snippets === _memoSnippets &&
    skills === _memoSkills &&
    snippetsBySkill === _memoSnippetsBySkill
  ) {
    return _memoResult;
  }

  const save = (result: SkillGroup[]): SkillGroup[] => {
    _memoAgent = agent;
    _memoSnippets = snippets;
    _memoSkills = skills;
    _memoSnippetsBySkill = snippetsBySkill;
    _memoResult = result;
    return result;
  };

  if (!agent || agent.activeSet.size === 0) return save([]);

  return save(
    buildSkillGroups(agent, snippets, skills, snippetsBySkill).map((g) => ({
      skillId: g.skillId,
      skillName:
        g.skillId === UNTAGGED_SKILL_ID
          ? "Untagged"
          : (skills.get(g.skillId)?.name ?? g.skillId),
      snippets: g.snippets,
    })),
  );
};

export const selectActiveAgent = (storeState: StoreState): Agent | null => {
  if (!storeState.activeAgentId) return null;
  return storeState.agents.get(storeState.activeAgentId) ?? null;
};

export const selectSortedAgents = (storeState: StoreState): Agent[] =>
  sortByName([...storeState.agents.values()]);

export interface AgentsSlice {
  activeAgentId: string | null;

  addAgent: (name: string) => void;
  updateAgent: (id: string, patch: { name?: string }) => void;
  deleteAgent: (id: string) => void;
  setActiveAgentId: (id: string | null) => void;
}

export const createAgentsSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  AgentsSlice
> = (set) => ({
  activeAgentId: null,

  addAgent: (name) => {
    const agent: Agent = {
      id: crypto.randomUUID(),
      name,
      activeSet: new Set<string>(),
    };
    set((s) => {
      s.agents.set(agent.id, agent);
      s.activeAgentId ??= agent.id;
    });
  },

  updateAgent: (id, patch) => {
    set((s) => {
      const existing = s.agents.get(id);
      if (!existing) return;
      s.agents.set(id, { ...existing, ...patch });
    });
  },

  deleteAgent: (id) => {
    set((s) => {
      s.agents.delete(id);
      if (s.activeAgentId === id) {
        const remaining = sortByName([...s.agents.values()]);
        s.activeAgentId = remaining[0]?.id ?? null;
      }
    });
  },

  setActiveAgentId: (id) => {
    set({ activeAgentId: id });
  },
});
