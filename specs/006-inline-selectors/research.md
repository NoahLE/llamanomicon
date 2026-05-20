# Research: Inline Store Selectors and Index Utilities

**Branch**: `006-inline-selectors` | **Date**: 2026-04-20

---

## Decision 1: Placement of `selectCompiledOutput`

**Question**: `selectCompiledOutput` depends on both `outputSettings` (owned by `useSettings.ts`) and the active agent (owned by `useAgents.ts`). Where does it live?

**Decision**: `useSettings.ts`

**Rationale**: The function transforms raw snippet text through a formatting pipeline defined by `outputSettings`. The agent is the data source; the settings control the shape of the output. Placing it in the settings slice keeps the "how the output is formatted" logic with the "what formatting is configured" data.

**Circular dependency check**:
- `useSettings.ts` imports `selectActiveAgent` from `useAgents.ts` (value import)
- `useAgents.ts` imports `type { StoreState }` from `useAppStore.ts` (type-only, erased at runtime)
- `useAppStore.ts` imports `createSettingsSlice` from `useSettings.ts` (value import)

Runtime graph: `useAppStore` → `useSettings` → `useAgents` (no cycle — `useAgents` → `useAppStore` is type-only and erased). **Safe.**

**Alternatives considered**:
- `useAgents.ts` — valid (active agent is the primary data source), but then settings would be a parameter rather than the slice's own data. Deferred.
- `useAppStore.ts` — would work (has access to everything) but useAppStore should only merge slices, not define selectors.

---

## Decision 2: Placement of `sortByName`

**Question**: `sortByName` is a private helper used by `selectSortedAgents`, `selectSortedSkills`, `selectSnippetsForSkill`, `selectUntaggedSnippets`, `selectAllSnippets`, and `selectAllSnippets`. Should it be extracted to a shared utility or duplicated?

**Decision**: Duplicate into each destination slice file as a module-private function.

**Rationale**: The function is 2 lines. Extracting it to `src/lib/sort.ts` for 2-line functions shared across 3 files creates more overhead (new file, new import) than the duplication saves. Constitution §V requires at least two concrete call-sites before extraction; while there are three destinations, the function is so trivial that the rule-of-three threshold does not override the simplicity principle here.

**Alternatives considered**:
- `src/lib/sort.ts` utility — rejected; too small to justify a new module.
- Keep in `selectors.ts` and import from there — rejected; the goal is to delete `selectors.ts`.

---

## Decision 3: Fate of `indexes.test.ts` after `buildSnippetsBySkill` becomes private

**Question**: `src/lib/tests/indexes.test.ts` tests `buildSnippetsBySkill` directly. After the function becomes module-private in `useDataControls.ts`, it is no longer importable. What replaces the test?

**Decision**: Delete `indexes.test.ts`. The function's correctness is covered indirectly through `rebuildIndex()`, `discardSession()`, and `seedData()` — all of which call `buildSnippetsBySkill` and can be tested via store actions per Constitution §VI (native-mechanism-first).

If the existing `useDataControls.test.ts` does not already cover these paths, a new describe block is added to `src/store/tests/useDataControls.test.ts`.

**Alternatives considered**:
- Export `buildSnippetsBySkill` from `useDataControls.ts` for test access — rejected; exporting a private implementation detail to satisfy a test is an antipattern.
- Move test to `useDataControls.test.ts` with a direct function import — rejected; same antipattern.

---

## Decision 4: Fate of `selectors.test.ts`

**Question**: `src/store/tests/selectors.test.ts` tests all selectors in one file. After migration, selectors live in four different slice files. What happens to this test file?

**Decision**: Delete `selectors.test.ts`. Its test cases are distributed into the existing (or newly created) per-slice test files:
- `selectActiveAgent`, `selectSortedAgents` → `src/store/tests/useAgents.test.ts`
- `selectSelectedSkill`, `selectSortedSkills`, `selectSnippetsForSkill` → `src/store/tests/useSkills.test.ts`
- `selectUntaggedSnippets`, `selectAllSnippets` → `src/store/tests/useSnippets.test.ts`
- `selectCompiledOutput` → `src/store/tests/useSettings.test.ts`

**Alternatives considered**:
- Keep `selectors.test.ts` with updated import paths — rejected; a test file named `selectors.test.ts` that imports from four different modules is misleading and violates the constitution's naming convention (test file name must match source file name).

---

## Decision 5: `createSelectors` utility placement

**Question**: `createSelectors` is a Zustand pattern utility defined in `selectors.ts` and used only in `useAppStore.ts`. Where does it go?

**Decision**: Inline directly into `useAppStore.ts`. Not exported.

**Rationale**: Single call-site, framework plumbing, not domain logic. Constitution §V prohibits exporting utilities with only one consumer.

---

## Decision 6: Component test mock strategy after selector split

**Question**: `src/components/tests/testUtils.ts` mocks selectors via `import * as selectors` and `vi.spyOn(selectors, "...")`. After migration, selectors live in multiple modules. How are mocks updated?

**Decision**: Update `testUtils.ts` to import each module separately and spy per-module:

```typescript
import * as agentSelectors from "@/store/useAgents";
import * as skillSelectors from "@/store/useSkills";
import * as snippetSelectors from "@/store/useSnippets";
import * as settingsSelectors from "@/store/useSettings";

vi.spyOn(agentSelectors, "selectSortedAgents").mockReturnValue(...);
vi.spyOn(skillSelectors, "selectSortedSkills").mockReturnValue(...);
// etc.
```

Component test files (`OutputWindow.test.tsx`, `SnippetsPanel.test.tsx`, `SkillsList.test.tsx`) call `mockStore()` from `testUtils.ts` and require no further changes, as long as `testUtils.ts` is the only file that references the selector modules directly.

**Vitest ESM compatibility**: Vitest handles ESM `vi.spyOn` correctly on named exports when modules are properly configured. The existing configuration already works for spying — splitting the source modules does not change this.
