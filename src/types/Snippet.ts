import type { Entity } from "@/types/Entity";

export interface Snippet extends Entity {
  text: string;
  skills: Set<string>;
}
