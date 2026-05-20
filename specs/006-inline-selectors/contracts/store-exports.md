# Store Export Contracts: Post-Migration

This document defines the new export locations for all identifiers previously exported from `src/store/selectors.ts` and `src/lib/indexes.ts`. It is the authoritative reference for updating imports across the codebase.

---

## `src/store/useAgents.ts`

New exports added by this feature:

```typescript
// Pure selector — returns Agent or null for the currently active agent ID
export const selectActiveAgent = (storeState: StoreState): Agent | null

// Pure selector — returns all agents sorted alphabetically by name
export const selectSortedAgents = (storeState: StoreState): Agent[]
```

Consumers to update:
- `src/components/AgentList.tsx` — `selectSortedAgents`
- `src/components/OutputWindow.tsx` — `selectActiveAgent`
- `src/store/useSettings.ts` — `selectActiveAgent` (called inside `selectCompiledOutput`)
- `src/components/tests/testUtils.ts` — `selectSortedAgents`, `selectActiveAgent`
- `src/store/tests/useAgents.test.ts` — new test cases for both selectors

---

## `src/store/useSkills.ts`

New exports added by this feature:

```typescript
// Constant — virtual skill ID for the "untagged snippets" filter
export const UNTAGGED_SKILL_ID = "__untagged__"

// Pure selector — returns Skill or null for the currently active skill ID
export const selectSelectedSkill = (storeState: StoreState): Skill | null

// Pure selector — returns all skills sorted alphabetically by name
export const selectSortedSkills = (storeState: StoreState): Skill[]

// Pure selector — returns all snippets tagged with skillId, sorted by name
export const selectSnippetsForSkill = (storeState: StoreState, skillId: string): Snippet[]
```

Consumers to update:
- `src/components/SkillsList.tsx` — `selectSortedSkills`, `UNTAGGED_SKILL_ID`
- `src/components/tests/testUtils.ts` — `selectSortedSkills`
- `src/store/tests/useSkills.test.ts` — new test cases for all three selectors

---

## `src/store/useSnippets.ts`

New exports added by this feature:

```typescript
// Pure selector — returns all snippets with no skills, sorted by name
export const selectUntaggedSnippets = (storeState: StoreState): Snippet[]

// Pure selector — returns all snippets sorted alphabetically by name
export const selectAllSnippets = (storeState: StoreState): Snippet[]
```

Consumers to update:
- `src/components/tests/testUtils.ts` — `selectAllSnippets`
- `src/store/tests/useSnippets.test.ts` — new test cases for both selectors

---

## `src/store/useSettings.ts`

New exports added by this feature:

```typescript
// Pure selector — returns the compiled output string for the active agent
// Internally calls selectActiveAgent from useAgents.ts
export const selectCompiledOutput = (storeState: StoreState): string
```

Consumers to update:
- `src/components/OutputWindow.tsx` — `selectCompiledOutput`
- `src/components/tests/testUtils.ts` — `selectCompiledOutput`
- `src/store/tests/useSettings.test.ts` — new test cases

---

## `src/store/useAppStore.ts`

Changes (no new exports):
- `createSelectors` type and function definition inlined here (was imported from `selectors.ts`)
- `import { createSelectors } from "./selectors"` removed

---

## `src/store/useDataControls.ts`

Changes (no new exports):
- `buildSnippetsBySkill` defined as a module-private function (unexported)
- `import { buildSnippetsBySkill } from "@/lib/indexes"` removed

---

## Deleted files

| File | Reason |
|------|--------|
| `src/store/selectors.ts` | All exports migrated to owning slices |
| `src/lib/indexes.ts` | `buildSnippetsBySkill` inlined as private function in `useDataControls.ts` |
| `src/lib/tests/indexes.test.ts` | Function no longer exported; behavior covered by `useDataControls` store action tests |
| `src/store/tests/selectors.test.ts` | Cases redistributed to per-slice test files |
