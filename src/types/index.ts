export type { Snippet } from "@/types/Snippet";
export type { Skill } from "@/types/Skill";
export type { Agent } from "@/types/Agent";

import type { Snippet } from "@/types/Snippet";
import type { Skill } from "@/types/Skill";
import type { Agent } from "@/types/Agent";
import type { Theme } from "@heroui/react";

export interface DataState {
  snippets: Map<string, Snippet>;
  skills: Map<string, Skill>;
  agents: Map<string, Agent>;
}

export interface SerializedSnippet {
  id: string;
  name: string;
  text: string;
  skills: string[];
}

export interface SerializedAgent {
  id: string;
  name: string;
  activeSet: string[];
}

export interface SerializedSkill {
  id: string;
  name: string;
}

export interface OutputSettings {
  theme: Theme;
}

export interface AppState {
  snippets: Record<string, SerializedSnippet>;
  skills: Record<string, SerializedSkill>;
  agents: Record<string, SerializedAgent>;
  outputSettings: OutputSettings;
  exportedAt?: string;
}
