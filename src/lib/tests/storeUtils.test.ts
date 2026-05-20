import { describe, it, expect } from "vitest";
import { sortByName, buildSnippetsBySkill } from "@/lib/storeUtils";
import type { Snippet } from "@/types";

describe("sortByName", () => {
  it("returns empty array for empty input", () => {
    expect(sortByName([])).toEqual([]);
  });

  it("returns single-item array unchanged", () => {
    const item = { id: "1", name: "Alpha" };
    expect(sortByName([item])).toEqual([item]);
  });

  it("sorts already-sorted array correctly", () => {
    const a = { id: "1", name: "Apple" };
    const b = { id: "2", name: "Banana" };
    expect(sortByName([a, b])).toEqual([a, b]);
  });

  it("sorts reverse-order array alphabetically", () => {
    const a = { id: "1", name: "Apple" };
    const b = { id: "2", name: "Banana" };
    const c = { id: "3", name: "Cherry" };
    expect(sortByName([c, b, a])).toEqual([a, b, c]);
  });

  it("is case-insensitive (locale order)", () => {
    const lower = { id: "1", name: "apple" };
    const upper = { id: "2", name: "Banana" };
    const result = sortByName([upper, lower]);
    // localeCompare: "apple" < "Banana" in most locales
    expect(result[0]).toBe(lower);
    expect(result[1]).toBe(upper);
  });
});

describe("buildSnippetsBySkill", () => {
  it("returns empty map for empty snippets", () => {
    expect(buildSnippetsBySkill(new Map())).toEqual(new Map());
  });

  it("returns empty map when no snippets have skills", () => {
    const s: Snippet = { id: "s1", name: "S", text: "t", skills: new Set() };
    expect(buildSnippetsBySkill(new Map([["s1", s]]))).toEqual(new Map());
  });

  it("indexes a snippet under its single skill", () => {
    const s: Snippet = {
      id: "s1",
      name: "S",
      text: "t",
      skills: new Set(["k1"]),
    };
    const index = buildSnippetsBySkill(new Map([["s1", s]]));
    expect(index.get("k1")).toEqual(new Set(["s1"]));
  });

  it("indexes a snippet under multiple skills", () => {
    const s: Snippet = {
      id: "s1",
      name: "S",
      text: "t",
      skills: new Set(["k1", "k2"]),
    };
    const index = buildSnippetsBySkill(new Map([["s1", s]]));
    expect(index.get("k1")).toEqual(new Set(["s1"]));
    expect(index.get("k2")).toEqual(new Set(["s1"]));
  });

  it("groups multiple snippets under the same skill", () => {
    const s1: Snippet = {
      id: "s1",
      name: "S1",
      text: "t",
      skills: new Set(["k1"]),
    };
    const s2: Snippet = {
      id: "s2",
      name: "S2",
      text: "t",
      skills: new Set(["k1"]),
    };
    const index = buildSnippetsBySkill(
      new Map([
        ["s1", s1],
        ["s2", s2],
      ]),
    );
    expect(index.get("k1")).toEqual(new Set(["s1", "s2"]));
  });

  it("keeps skills with no snippets out of the index", () => {
    const s: Snippet = { id: "s1", name: "S", text: "t", skills: new Set() };
    const index = buildSnippetsBySkill(new Map([["s1", s]]));
    expect(index.size).toBe(0);
  });
});
