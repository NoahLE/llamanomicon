import type { StateCreator } from "zustand";

import type { StoreState } from "@/store/useAppStore";

export interface AgentsSnippetsSlice {
  activateSnippet: (agentId: string, snippetId: string) => void;
  deactivateSnippet: (agentId: string, snippetId: string) => void;
}

export const createAgentsSnippetsSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  AgentsSnippetsSlice
> = (set) => ({
  activateSnippet: (agentId, snippetId) => {
    set((s) => {
      const agent = s.agents.get(agentId);
      if (!agent || agent.activeSet.has(snippetId)) return;
      agent.activeSet.add(snippetId);
      const sorted = Array.from(agent.activeSet).sort();
      agent.activeSet = new Set(sorted);
    });
  },

  deactivateSnippet: (agentId, snippetId) => {
    set((s) => {
      const agent = s.agents.get(agentId);
      if (!agent?.activeSet.has(snippetId)) return;
      agent.activeSet.delete(snippetId);
      const sorted = Array.from(agent.activeSet).sort();
      agent.activeSet = new Set(sorted);
    });
  },
});
