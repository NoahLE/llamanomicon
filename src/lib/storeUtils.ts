import type { Snippet } from "@/types";

export const UNTAGGED_SKILL_ID = "__untagged__";

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function buildSnippetsBySkill(
  snippets: Map<string, Snippet>,
): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const [snippetId, snippet] of snippets) {
    for (const skillId of snippet.skills) {
      let set = index.get(skillId);
      if (!set) {
        set = new Set<string>();
        index.set(skillId, set);
      }
      set.add(snippetId);
    }
  }
  return index;
}
