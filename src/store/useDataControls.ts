import type { StateCreator } from "zustand";

import type {
  DataState,
  Snippet,
  Agent,
  AppState,
  OutputSettings,
} from "@/types";
import type { StoreState } from "@/store/useAppStore";
import {
  buildSnippetsBySkill,
  sortByName,
  UNTAGGED_SKILL_ID,
} from "@/lib/storeUtils";
import jsonSeedData from "@/data/seed.json";

import { validateAppState } from "@/lib/importExport";
import { replacer } from "@/lib/serialization";

function areMapsDifferent(
  first: Map<string, unknown>,
  second: Map<string, unknown>,
) {
  const firstString = JSON.stringify(first, replacer);
  const secondString = JSON.stringify(second, replacer);
  return firstString === secondString;
}

export const selectHasUnsavedChanges = (storeState: StoreState) => {
  const agents = areMapsDifferent(
    storeState.agents,
    storeState.baseline.agents,
  );
  const snippets = areMapsDifferent(
    storeState.snippets,
    storeState.baseline.snippets,
  );
  const skills = areMapsDifferent(
    storeState.skills,
    storeState.baseline.skills,
  );
  return !(snippets && agents && skills);
};

const DEFAULT_OUTPUT_SETTINGS: OutputSettings = {
  theme: "light",
};

const emptyData = (): DataState => ({
  snippets: new Map(),
  skills: new Map(),
  agents: new Map(),
});

export interface DataControlsSlice {
  lastImportTimestamp: string | null;
  importState: (appState: AppState) => void;
  saveSession: () => void;
  discardSession: () => void;
  clearData: () => void;
  seedData: () => void;
}

export const createDataControlsSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  DataControlsSlice
> = (set, get) => ({
  lastImportTimestamp: null,

  importState: (serialized) => {
    const snippets = new Map<string, Snippet>();
    for (const [id, s] of Object.entries(serialized.snippets)) {
      snippets.set(id, { ...s, skills: new Set(s.skills) });
    }

    const skills = new Map(Object.entries(serialized.skills));

    const agents = new Map<string, Agent>();
    for (const [id, a] of Object.entries(serialized.agents)) {
      agents.set(id, {
        ...a,
        activeSet: new Set(a.activeSet),
      });
    }

    const data: DataState = { snippets, skills, agents };

    set((store) => {
      store.baseline = structuredClone(data);
      store.agents = agents;
      store.snippets = snippets;
      store.skills = skills;
      store.snippetsBySkill = buildSnippetsBySkill(snippets);
      store.outputSettings = serialized.outputSettings;
      store.activeAgentId = sortByName([...agents.values()])[0]?.id ?? null;
      store.activeSkillId = null;
      store.lastImportTimestamp = serialized.exportedAt ?? null;
    });
  },

  saveSession: () => {
    const { agents, snippets, skills } = get();
    set((store) => {
      store.baseline = structuredClone({ agents, snippets, skills });
    });
  },

  discardSession: () => {
    // Read baseline before entering Immer producer — proxies cannot be structuredCloned
    const cloned = structuredClone(get().baseline);
    set((store) => {
      store.agents = cloned.agents;
      store.snippets = cloned.snippets;
      store.skills = cloned.skills;
      store.snippetsBySkill = buildSnippetsBySkill(cloned.snippets);
      if (!store.activeAgentId || !cloned.agents.has(store.activeAgentId)) {
        const sorted = sortByName([...cloned.agents.values()]);
        store.activeAgentId = sorted[0]?.id ?? null;
      }
    });
  },

  clearData: () => {
    const data = emptyData();
    set((store) => {
      store.baseline = data;
      store.agents = new Map();
      store.snippets = new Map();
      store.skills = new Map();
      store.snippetsBySkill = new Map();
      store.outputSettings = DEFAULT_OUTPUT_SETTINGS;
      store.activeAgentId = null;
      store.activeSkillId = null;
      store.lastImportTimestamp = null;
    });
  },

  seedData: () => {
    get().importState(validateAppState(jsonSeedData));
    const firstAgentId = [...get().agents.keys()][0] ?? null;
    set((store) => {
      store.activeAgentId = firstAgentId;
      store.activeSkillId = UNTAGGED_SKILL_ID;
    });
  },
});
