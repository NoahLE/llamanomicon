import { describe, it, expect } from "vitest";
import { validateAppState, serializeState } from "@/lib/importExport";
import type { AppState, Snippet, Agent, Skill } from "@/types";
import type { StoreState } from "@/store/useAppStore";
import type { Theme } from "@heroui/react";

describe("importExport", () => {
  describe("validateAppState", () => {
    it("validates a correct AppState", () => {
      const valid: AppState = {
        snippets: {},
        skills: {},
        agents: {},
        outputSettings: { theme: "light" },
      };
      expect(validateAppState(valid)).toEqual(valid);
    });

    it("throws on missing snippets", () => {
      const invalid = {
        skills: {},
        agents: {},
        outputSettings: {},
      };
      expect(() => validateAppState(invalid)).toThrow(
        'missing or invalid "snippets"',
      );
    });

    it("throws on missing outputSettings", () => {
      const invalid = {
        snippets: {},
        skills: {},
        agents: {},
      };
      expect(() => validateAppState(invalid)).toThrow(
        'missing "outputSettings"',
      );
    });
  });

  describe("serializeState", () => {
    it("converts Maps/Sets to Records/Arrays", () => {
      const s1: Snippet = {
        id: "s1",
        name: "S1",
        text: "T1",
        skills: new Set(["k1"]),
      };
      const k1: Skill = { id: "k1", name: "K1" };
      const a1: Agent = {
        id: "a1",
        name: "A1",
        activeSet: new Set(["s1"]),
      };

      const storeState = {
        baseline: {
          snippets: new Map([["s1", s1]]),
          skills: new Map([["k1", k1]]),
          agents: new Map([["a1", a1]]),
        },
        outputSettings: { theme: "light" as Theme },
      } as unknown as StoreState;

      const serialized = serializeState(storeState);

      expect(serialized.snippets.s1).toEqual({
        id: "s1",
        name: "S1",
        text: "T1",
        skills: ["k1"],
      });
      expect(serialized.skills.k1).toEqual({ id: "k1", name: "K1" });
      expect(serialized.agents.a1).toEqual({
        id: "a1",
        name: "A1",
        activeSet: ["s1"],
      });
      expect(serialized.outputSettings.theme).toBe("light");
    });
  });
});
