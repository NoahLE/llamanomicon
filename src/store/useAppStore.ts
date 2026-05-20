import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StoreApi, UseBoundStore } from "zustand";

import { replacer, reviver } from "@/lib/serialization";
import { buildSnippetsBySkill } from "@/lib/storeUtils";
import type { DataState, Agent, Skill, Snippet } from "@/types";

import { createSnippetsSlice, type SnippetsSlice } from "@/store/useSnippets";
import { createSkillsSlice, type SkillsSlice } from "@/store/useSkills";
import {
  createAgentsSlice,
  selectSortedAgents,
  type AgentsSlice,
} from "@/store/useAgents";
import {
  createAgentsSnippetsSlice,
  type AgentsSnippetsSlice,
} from "@/store/useAgentSnippets";
import { createSettingsSlice, type SettingsSlice } from "@/store/useSettings";
import {
  createDataControlsSlice,
  type DataControlsSlice,
} from "@/store/useDataControls";

export interface StoreState
  extends
    SnippetsSlice,
    SkillsSlice,
    AgentsSlice,
    AgentsSnippetsSlice,
    SettingsSlice,
    DataControlsSlice {
  baseline: DataState;
  agents: Map<string, Agent>;
  snippets: Map<string, Snippet>;
  skills: Map<string, Skill>;
}

const useAppStoreBase = create<StoreState>()(
  devtools(
    persist(
      immer((set, get, api) => ({
        baseline: {
          snippets: new Map(),
          skills: new Map(),
          agents: new Map(),
        },
        agents: new Map(),
        snippets: new Map(),
        skills: new Map(),
        ...createSnippetsSlice(set, get, api),
        ...createSkillsSlice(set, get, api),
        ...createAgentsSlice(set, get, api),
        ...createAgentsSnippetsSlice(set, get, api),
        ...createSettingsSlice(set, get, api),
        ...createDataControlsSlice(set, get, api),
      })),
      {
        name: "llamanomicon-v2",
        storage: createJSONStorage(() => localStorage, {
          reviver,
          replacer,
        }),
        partialize: (state) => ({
          baseline: state.baseline,
          outputSettings: state.outputSettings,
          lastImportTimestamp: state.lastImportTimestamp,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            const cloned = structuredClone(state.baseline);
            state.agents = cloned.agents;
            state.snippets = cloned.snippets;
            state.skills = cloned.skills;
            state.snippetsBySkill = buildSnippetsBySkill(
              state.snippets as Map<string, Snippet>,
            );
            const sorted = selectSortedAgents(state);
            if (sorted.length > 0) {
              state.activeAgentId = sorted[0]?.id ?? null;
            }
          }
        },
      },
    ),
    { name: "llamanomicon" },
  ),
);

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as Record<string, () => unknown>)[k] = () =>
      store((s) => s[k as keyof typeof s]);
  }
  return store;
};

export const useAppStore = createSelectors(useAppStoreBase);

// Seed on first run — fires once at module load after synchronous localStorage hydration
const { agents, snippets, skills } = useAppStore.getState().baseline;
if (agents.size === 0 && snippets.size === 0 && skills.size === 0) {
  useAppStoreBase.getState().seedData();
}
