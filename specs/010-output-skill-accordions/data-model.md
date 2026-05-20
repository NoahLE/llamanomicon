# Data Model: Output Skill Accordions

**Branch**: `010-output-skill-accordions`  
**Date**: 2026-04-24  
**Revision**: Within-group order is alphabetical (skill window order); `activeOrder` not used in output path

---

## Modified Entity: Agent

### Current Shape (`src/types/Agent.ts`)

```ts
export interface Agent extends Entity {
  activeSet: Set<string>;    // O(1) membership check
  activeOrder: string[];     // activation/drag order — currently drives output compilation
}
```

### New Shape (after this feature)

```ts
export interface Agent extends Entity {
  activeSet: Set<string>;        // unchanged — tracks which snippets are active
  activeOrder: string[];         // unchanged structurally — still used for cascade deletes and activation tracking; NOT used for output ordering
  skillGroupOrder: string[];     // NEW: ordered array of skill IDs for group arrangement in OutputWindow
}
```

### Field: `skillGroupOrder`

| Property    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Type        | `string[]`                                                                               |
| Default     | `[]` (empty array — groups render alphabetically by skill name)                          |
| Source      | User drag-and-drop reordering of accordion sections in the Output Window                 |
| Persistence | Draft state → baseline on save; participates fully in save/discard/import/export cycle   |
| Special IDs | `UNTAGGED_SKILL_ID = "__untagged__"` always renders last regardless of position in array |

**Ordering rules applied at render/compile time:**

1. Skills in `skillGroupOrder` render in that order (only if they have active snippets).
2. Skills with active snippets but absent from `skillGroupOrder` render alphabetically by name after the explicit ones.
3. The "Untagged" group (`UNTAGGED_SKILL_ID`) always renders last.
4. Within each group, snippets appear alphabetically by name — matching `selectSnippetsForSkill` / the SnippetsPanel display order.

### Note on `activeOrder`

`activeOrder` is retained in the Agent type. It continues to be maintained by `activateSnippet`, `deactivateSnippet`, and `reorderSnippets`. However, it is **no longer consulted by the output compiler** in this feature. Its role is limited to tracking activation sequence and participating in cascade-delete operations.

---

## Modified Type: SerializedAgent

### Current Shape (`src/types/index.ts`)

```ts
export interface SerializedAgent {
  id: string;
  name: string;
  activeSet: string[];    // Set serialized as array
  activeOrder: string[];
}
```

### New Shape

```ts
export interface SerializedAgent {
  id: string;
  name: string;
  activeSet: string[];
  activeOrder: string[];
  skillGroupOrder: string[];    // NEW — plain array, no special serialization needed
}
```

**Backward compatibility**: `importState` must default `skillGroupOrder` to `[]` when deserializing agents that lack the field (existing localStorage data from before this feature).

---

## New Derived Type: SkillGroup (UI-only, not persisted)

Used by `selectSkillGroupsForOutput` as the data contract between the store and `OutputWindow`.

```ts
interface SkillGroup {
  skillId: string;          // skill ID (or UNTAGGED_SKILL_ID)
  skillName: string;        // display name ("Untagged" for virtual group)
  snippets: Snippet[];      // active snippets for this skill, sorted alphabetically by name
}
```

This type is **not persisted** — derived on each render from:
- `agent.skillGroupOrder`
- `agent.activeSet`
- `snippetsBySkill` (derived index)
- `draft.skills`
- `draft.snippets`

**Snippet ordering within each group**: `sortByName(activeSnippetsForSkill)` — identical to `selectSnippetsForSkill` output, filtered to active.

---

## State Transitions

### On `reorderSkillGroups(agentId, newOrder)`

```
draft.agents[agentId].skillGroupOrder = newOrder
```

Only `skillGroupOrder` changes. `activeSet` and `activeOrder` are untouched.

### On `activateSnippet` / `deactivateSnippet`

- `skillGroupOrder` is NOT modified — group arrangement is stable across activation changes.
- The selector re-derives which groups have active snippets and filters accordingly.

### On `deleteSkill`

- `skillGroupOrder` must have the deleted skill ID removed from every agent (cascade).
- Added to `deleteSkill` in `useSkills.ts` alongside the existing cascade on `snippetsBySkill`.

### On Agent creation

```ts
repo.create(name, {
  activeSet: new Set<string>(),
  activeOrder: [],
  skillGroupOrder: [],   // NEW default
});
```

---

## Compilation Contract

`compileOutputBySkillGroup` output order:

```
for each skillGroup in orderedGroups:           // skill group order
  for each snippet in skillGroup.snippets:      // alphabetical within group
    if snippetId not in seen:                   // first-group dedup for multi-skill snippets
      emit snippet.text
      seen.add(snippetId)
join with settings.snippetSeparator
trim result
```

`orderedGroups` sequence:
1. Skills in `skillGroupOrder` that have ≥1 active snippet (array order)
2. Active-snippet skills absent from `skillGroupOrder` (alphabetical by skill name)
3. Untagged group (`UNTAGGED_SKILL_ID`) if any active untagged snippets exist
