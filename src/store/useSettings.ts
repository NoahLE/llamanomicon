import type { StateCreator } from "zustand";

import type { OutputSettings } from "@/types";
import type { StoreState } from "@/store/useAppStore";
import { compileOutputBySkillGroup, compileOutputXML } from "@/lib/compiler";
import { selectActiveAgent } from "@/store/useAgents";

export const selectCompiledOutput = (storeState: StoreState): string =>
  compileOutputBySkillGroup(
    selectActiveAgent(storeState),
    storeState.snippets,
    storeState.skills,
    storeState.snippetsBySkill,
  );

export const selectCompiledOutputXML = (storeState: StoreState): string =>
  compileOutputXML(
    selectActiveAgent(storeState),
    storeState.snippets,
    storeState.skills,
    storeState.snippetsBySkill,
  );

export interface SettingsSlice {
  outputSettings: OutputSettings;
  updateOutputSettings: (patch: Partial<OutputSettings>) => void;
}

const defaultSettings: OutputSettings = {
  theme: "light",
};

export const createSettingsSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  SettingsSlice
> = (set) => ({
  outputSettings: defaultSettings,

  updateOutputSettings: (patch) => {
    set((s) => {
      Object.assign(s.outputSettings, patch);
    });
  },
});
