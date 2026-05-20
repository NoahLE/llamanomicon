import type { StateCreator } from "zustand";

import type { Agent, Skill } from "@/types";
import { sortByName, UNTAGGED_SKILL_ID } from "@/lib/storeUtils";
import { selectActiveAgent } from "@/store/useAgents";

import type { StoreState } from "@/store/useAppStore";

// ── Selectors ────────────────────────────────────────────────────────────────

export { UNTAGGED_SKILL_ID };

export const selectSortedSkills = (storeState: StoreState): Skill[] =>
  sortByName([...storeState.skills.values()]);

function countActive(ids: Set<string>, agent: Agent): number {
  let count = 0;
  for (const id of ids) {
    if (agent.activeSet.has(id)) count++;
  }
  return count;
}

export const selectSnippetCountForSkill = (
  storeState: StoreState,
  skillId: string,
): { active: number; total: number } => {
  const snippetIds = storeState.snippetsBySkill.get(skillId);
  const total = snippetIds?.size ?? 0;
  const agent = selectActiveAgent(storeState);
  if (!agent || !snippetIds) return { active: 0, total };
  return { active: countActive(snippetIds, agent), total };
};

export const selectUntaggedSnippetCount = (
  storeState: StoreState,
): { active: number; total: number } => {
  let total = 0;
  let active = 0;
  const agent = selectActiveAgent(storeState);
  for (const snip of storeState.snippets.values()) {
    if (snip.skills.size === 0) {
      total++;
      if (agent?.activeSet.has(snip.id)) active++;
    }
  }
  return { active, total };
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export interface SkillsSlice {
  activeSkillId: string | null;
  addSkill: (name: string) => void;
  updateSkill: (id: string, patch: { name?: string }) => void;
  deleteSkill: (id: string) => void;
  setActiveSkillId: (id: string | null) => void;
}

export const createSkillsSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  SkillsSlice
> = (set) => ({
  activeSkillId: UNTAGGED_SKILL_ID,

  setActiveSkillId: (id) => {
    set({ activeSkillId: id });
  },

  addSkill: (name) => {
    const skill: Skill = { id: crypto.randomUUID(), name };
    set((s) => {
      s.skills.set(skill.id, skill);
    });
  },

  updateSkill: (id, patch) => {
    set((s) => {
      const existing = s.skills.get(id);
      if (!existing) return;
      s.skills.set(id, { ...existing, ...patch });
    });
  },

  deleteSkill: (id) => {
    set((s) => {
      s.skills.delete(id);

      // Cascade: remove skill from all snippets' skills sets
      for (const snippet of s.snippets.values()) {
        snippet.skills.delete(id);
      }

      // Cascade: remove from snippetsBySkill index
      s.snippetsBySkill.delete(id);

      if (s.activeSkillId === id) {
        s.activeSkillId = UNTAGGED_SKILL_ID;
      }
    });
  },
});
