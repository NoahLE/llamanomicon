export function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Map) {
    return { __type: "Map" as const, entries: [...value.entries()] };
  }
  if (value instanceof Set) {
    return { __type: "Set" as const, values: [...value] };
  }
  return value;
}

export function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.__type === "Map" && Array.isArray(obj.entries)) {
      return new Map(obj.entries as [unknown, unknown][]);
    }
    if (obj.__type === "Set" && Array.isArray(obj.values)) {
      return new Set(obj.values as unknown[]);
    }
  }
  return value;
}
