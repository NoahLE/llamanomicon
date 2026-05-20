/* eslint-disable @typescript-eslint/no-empty-function */
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { StateCreator } from "zustand";
import type { StoreState } from "@/store/useAppStore";
import type { DataState } from "@/types";

function emptyData(): DataState {
  return {
    snippets: new Map(),
    skills: new Map(),
    agents: new Map(),
  };
}

export function createTestStore(
  sliceCreator: StateCreator<
    StoreState,
    [["zustand/immer", never]],
    [],
    Partial<StoreState>
  >,
) {
  return createStore<StoreState>()(
    immer((set, get, api) => ({
      baseline: emptyData(),
      agents: new Map(),
      snippets: new Map(),
      skills: new Map(),
      snippetsBySkill: new Map(),
      activeAgentId: null,
      activeSkillId: null,
      outputSettings: { theme: "light" },
      updateOutputSettings: () => {},
      addSnippet: () => {},
      updateSnippet: () => {},
      deleteSnippet: () => {},
      addSkillToSnippet: () => {},
      removeSkillFromSnippet: () => {},
      addAgent: () => {},
      updateAgent: () => {},
      deleteAgent: () => {},
      setActiveAgentId: () => {},
      activateSnippet: () => {},
      deactivateSnippet: () => {},
      addSkill: () => {},
      updateSkill: () => {},
      deleteSkill: () => {},
      setActiveSkillId: () => {},
      lastImportTimestamp: null,
      saveSession: () => {},
      discardSession: () => {},
      importState: () => {},
      clearData: () => {},
      seedData: () => {},
      ...sliceCreator(set, get, api),
    })),
  );
}
