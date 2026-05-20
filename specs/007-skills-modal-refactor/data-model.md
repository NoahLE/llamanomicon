# Data Model: Skills Section Modal Refactor

**Branch**: `007-skills-modal-refactor` | **Date**: 2026-04-22

## Overview

This feature makes no changes to the core data model. `Skill`, `Snippet`, and `Agent` entities are unchanged. The only data-layer changes are:

1. **`activeSkillId` default** — changed from `null` to `UNTAGGED_SKILL_ID` in `createSkillsSlice`
2. **`deleteSkill` cascade** — reverts `activeSkillId` to `UNTAGGED_SKILL_ID` (not `null`) when the active skill is deleted

---

## Affected State Fields

### `activeSkillId: string`

| Property | Before | After |
|---|---|---|
| Type | `string \| null` | `string \| null` _(type unchanged for now)_ |
| Initial value | `null` | `UNTAGGED_SKILL_ID` (`"__untagged__"`) |
| Valid runtime values | any skill ID, `UNTAGGED_SKILL_ID`, or `null` | any skill ID or `UNTAGGED_SKILL_ID` (`null` is never set) |
| On `deleteSkill` (active skill) | → `null` | → `UNTAGGED_SKILL_ID` |

> **Note**: The TypeScript type remains `string | null` to avoid a wide refactor. The runtime invariant (never `null` after initialization) is enforced by the store logic, not the type.

---

## Entities (Unchanged)

### Skill

```typescript
interface Skill {
  id: string;       // crypto.randomUUID()
  name: string;
}
```

No changes. Many-to-many with `Snippet` via `snippet.skills: Set<string>`. Not related to `Agent`.

### Derived: Untagged Virtual Filter

`UNTAGGED_SKILL_ID = "__untagged__"` is a synthetic constant, not a stored `Skill`. It is never in `draft.skills` and has no entry in `snippetsBySkill`. The UI treats it as a pinned first item in the Listbox.

---

## Selectors (Unchanged)

| Selector | Returns | Used by |
|---|---|---|
| `selectSortedSkills` | `Skill[]` sorted A–Z | `Skills.tsx` |
| `selectSnippetCountForSkill(state, skillId)` | `{ active: number; total: number }` | `Skills.tsx` per named skill |
| `selectUntaggedSnippetCount(state)` | `{ active: number; total: number }` | `Skills.tsx` for Untagged item |
| `selectSelectedSkill` | `Skill \| null` | Not used by `Skills.tsx` directly |

---

## Store Actions (Unchanged API, One Internal Fix)

| Action | Signature | Change |
|---|---|---|
| `addSkill` | `(name: string) => void` | None |
| `updateSkill` | `(id: string, patch: { name?: string }) => void` | None |
| `deleteSkill` | `(id: string) => void` | Cascade: `activeSkillId` → `UNTAGGED_SKILL_ID` (not `null`) |
| `setActiveSkillId` | `(id: string \| null) => void` | None |

---

## State Transitions

```
App loads
  └─ activeSkillId = UNTAGGED_SKILL_ID   ← changed from null

User clicks Skill X (X ≠ activeSkillId)
  └─ activeSkillId = X.id

User clicks Skill X (X === activeSkillId)
  └─ activeSkillId unchanged              ← enforced by component guard

User deletes active Skill X
  └─ activeSkillId = UNTAGGED_SKILL_ID   ← changed from null

User deletes non-active Skill Y
  └─ activeSkillId unchanged
```

---

## Persistence

`activeSkillId` is **not** part of the `baseline` persisted to localStorage. It is pure session state — it resets to `UNTAGGED_SKILL_ID` on every page load via `createSkillsSlice` initialization.
