import type { StateCreator } from "zustand";

import type { Snippet } from "@/types";
import { sortByName } from "@/lib/storeUtils";

import type { StoreState } from "@/store/useAppStore";

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectAllSnippets = (storeState: StoreState): Snippet[] =>
  sortByName([...storeState.snippets.values()]);

export const selectUntaggedSnippets = (storeState: StoreState): Snippet[] => {
  const result: Snippet[] = [];
  for (const snip of storeState.snippets.values()) {
    if (snip.skills.size === 0) result.push(snip);
  }
  return sortByName(result);
};

export const selectSnippetsForSkill = (
  storeState: StoreState,
  skillId: string,
): Snippet[] => {
  const ids = storeState.snippetsBySkill.get(skillId);
  if (!ids) return [];
  const result: Snippet[] = [];
  for (const id of ids) {
    const snip = storeState.snippets.get(id);
    if (snip) result.push(snip);
  }
  return sortByName(result);
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export interface SnippetsSlice {
  snippetsBySkill: Map<string, Set<string>>;
  addSnippet: (name: string, text: string, skills?: Set<string>) => void;
  updateSnippet: (
    id: string,
    patch: Partial<Pick<Snippet, "name" | "text">>,
  ) => void;
  deleteSnippet: (id: string) => void;
  addSkillToSnippet: (snippetId: string, skillId: string) => void;
  removeSkillFromSnippet: (snippetId: string, skillId: string) => void;
}

export const createSnippetsSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  SnippetsSlice
> = (set) => ({
  snippetsBySkill: new Map(),

  addSnippet: (name, text, skills = new Set<string>()) => {
    const snippet: Snippet = { id: crypto.randomUUID(), name, text, skills };
    set((s) => {
      for (const skillId of skills) {
        const existing = s.snippetsBySkill.get(skillId);
        if (existing) {
          existing.add(snippet.id);
        } else {
          s.snippetsBySkill.set(skillId, new Set([snippet.id]));
        }
      }
      s.snippets.set(snippet.id, snippet);
    });
  },

  updateSnippet: (id, patch) => {
    set((s) => {
      const existing = s.snippets.get(id);
      if (!existing) return;
      s.snippets.set(id, { ...existing, ...patch });
    });
  },

  deleteSnippet: (id) => {
    set((s) => {
      const snippet = s.snippets.get(id);
      if (!snippet) return;

      s.snippets.delete(id);

      // Cascade: remove from snippetsBySkill
      for (const skillId of snippet.skills) {
        const skillSet = s.snippetsBySkill.get(skillId);
        if (skillSet) {
          skillSet.delete(id);
          if (skillSet.size === 0) s.snippetsBySkill.delete(skillId);
        }
      }

      // Cascade: remove from all agents' activeSet
      for (const agent of s.agents.values()) {
        agent.activeSet.delete(id);
      }
    });
  },

  addSkillToSnippet: (snippetId, skillId) => {
    set((s) => {
      const snippet = s.snippets.get(snippetId);
      if (!snippet || snippet.skills.has(skillId)) return;

      snippet.skills.add(skillId);

      const existing = s.snippetsBySkill.get(skillId);
      if (existing) {
        existing.add(snippetId);
      } else {
        s.snippetsBySkill.set(skillId, new Set([snippetId]));
      }
    });
  },

  removeSkillFromSnippet: (snippetId, skillId) => {
    set((s) => {
      const snippet = s.snippets.get(snippetId);
      if (!snippet?.skills.has(skillId)) return;

      snippet.skills.delete(skillId);

      const skillSet = s.snippetsBySkill.get(skillId);
      if (skillSet) {
        skillSet.delete(snippetId);
        if (skillSet.size === 0) s.snippetsBySkill.delete(skillId);
      }
    });
  },
});
