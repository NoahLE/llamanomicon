import type { Entity } from "@/types/Entity";

export interface Agent extends Entity {
  activeSet: Set<string>;
}
