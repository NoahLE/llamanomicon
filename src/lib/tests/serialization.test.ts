import { describe, it, expect } from "vitest";
import { replacer, reviver } from "@/lib/serialization";

describe("replacer", () => {
  it("passes through primitives unchanged", () => {
    expect(replacer("k", 42)).toBe(42);
    expect(replacer("k", "hello")).toBe("hello");
    expect(replacer("k", true)).toBe(true);
    expect(replacer("k", null)).toBe(null);
  });

  it("passes through plain objects unchanged", () => {
    const obj = { a: 1 };
    expect(replacer("k", obj)).toBe(obj);
  });

  it("serializes a Map to a custom object", () => {
    const m = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const result = replacer("k", m) as { __type: string; entries: unknown[] };
    expect(result.__type).toBe("Map");
    expect(result.entries).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("serializes a Set to a custom object", () => {
    const s = new Set(["x", "y"]);
    const result = replacer("k", s) as { __type: string; values: unknown[] };
    expect(result.__type).toBe("Set");
    expect(result.values).toEqual(["x", "y"]);
  });
});

describe("reviver", () => {
  it("passes through primitives unchanged", () => {
    expect(reviver("k", 42)).toBe(42);
    expect(reviver("k", "hello")).toBe("hello");
  });

  it("passes through plain objects without __type unchanged", () => {
    const obj = { a: 1 };
    expect(reviver("k", obj)).toBe(obj);
  });

  it("deserializes a Map from a custom object", () => {
    const serialized = {
      __type: "Map",
      entries: [
        ["a", 1],
        ["b", 2],
      ],
    };
    const result = reviver("k", serialized);
    expect(result).toBeInstanceOf(Map);
    expect((result as Map<string, number>).get("a")).toBe(1);
    expect((result as Map<string, number>).get("b")).toBe(2);
  });

  it("deserializes a Set from a custom object", () => {
    const serialized = { __type: "Set", values: ["x", "y"] };
    const result = reviver("k", serialized);
    expect(result).toBeInstanceOf(Set);
    expect((result as Set<string>).has("x")).toBe(true);
    expect((result as Set<string>).has("y")).toBe(true);
  });
});

describe("round-trip", () => {
  it("round-trips a Map through JSON stringify/parse", () => {
    const original = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const serialized = JSON.stringify(original, replacer);
    const restored = JSON.parse(serialized, reviver) as Map<string, number>;
    expect(restored).toBeInstanceOf(Map);
    expect(restored.get("a")).toBe(1);
    expect(restored.get("b")).toBe(2);
  });

  it("round-trips a Set through JSON stringify/parse", () => {
    const original = new Set(["foo", "bar"]);
    const serialized = JSON.stringify(original, replacer);
    const restored = JSON.parse(serialized, reviver) as Set<string>;
    expect(restored).toBeInstanceOf(Set);
    expect(restored.has("foo")).toBe(true);
    expect(restored.has("bar")).toBe(true);
  });

  it("round-trips nested Maps and Sets", () => {
    const original = new Map([["key", new Set(["a", "b"])]]);
    const serialized = JSON.stringify(original, replacer);
    const restored = JSON.parse(serialized, reviver) as Map<
      string,
      Set<string>
    >;
    expect(restored).toBeInstanceOf(Map);
    const inner = restored.get("key");
    expect(inner).toBeInstanceOf(Set);
    expect(inner?.has("a")).toBe(true);
    expect(inner?.has("b")).toBe(true);
  });
});
