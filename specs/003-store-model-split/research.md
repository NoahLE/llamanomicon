# Research: Store Model Split

**Feature**: `003-store-model-split` | **Date**: 2026-03-24

No external unknowns — all decisions were resolved prior to implementation using existing project knowledge, the Zustand documentation, and one clarification session (see `spec.md § Clarifications`). This document records the decisions and rationale for future reference.

---

## Decision 1: Slice Creator Function Pattern

**Decision**: Each domain file (`useFlows.ts`, `useGroups.ts`, `useSnippets.ts`, `useSettings.ts`) exports a `createXxxSlice(set, get, persist)` factory function returning a flat object of state fields and action functions. All four are spread into a single `create<StoreState>()` call in `useAppStore.ts`.

**Rationale**: This is the official Zustand slice pattern. It keeps one persistence point (`persist()` closure in root store), one type-checked Zustand store, and allows each domain file to be imported independently for types and testing without creating standalone stores that would complicate cross-slice state access and persistence coordination.

**Alternatives considered**:
- *Standalone `create()` per domain* — rejected because cross-slice reads (e.g., `toggleSnippet` needs `library` from the groups domain) require either circular imports or a shared pub/sub mechanism. Persistence would require a separate subscription layer.
- *Single flat store in one file* — rejected because the goal is code organization by domain. A 300+ line single file mixes all concerns.

---

## Decision 2: `StoreData` Type for Slice Typing

**Decision**: A `StoreData` interface (extending `AppState` with UI fields `activeFlowId` and `selectedGroupId`) was added to `src/types/index.ts`. Slice creator `set` and `get` parameters are typed against `StoreData` rather than the full `StoreState`.

**Rationale**: `StoreState` includes action functions and is defined in `useAppStore.ts`. If slice files imported `StoreState` from `useAppStore.ts` (which imports from the slice files), a runtime circular module dependency would result. `StoreData` contains only serializable data fields, lives in `types/index.ts` (which imports nothing from `store/`), and gives `set`/`get` calls proper types without `any`.

**Alternatives considered**:
- *`import type { StoreState }`* — type-only imports are erased at compile time, so technically safe from runtime circular deps. Rejected because it still creates a logical dependency that TypeScript's circular type resolution can occasionally mishandle in complex projects.
- *`any` with inline suppression comments* — rejected; violates Constitution I (use of `any` forbidden without inline suppression naming an unavoidable reason).

---

## Decision 3: Single `persist()` Closure in Root Store

**Decision**: A `persist()` function is defined once inside the `useAppStore` creator and passed as a third argument to each slice creator. Slices call `persist()` after every mutating action.

**Rationale**: Centralizes the persistence trigger. Each slice doesn't need to know about `saveState` or `extractAppState`. The root store owns the full state shape and thus is the correct place to assemble `AppState` for the Dexie write.

**Alternatives considered**:
- *`persistAll()` utility in `storeUtils.ts`* — would require importing `useGroups`, `useFlows`, `useSettings` from `storeUtils.ts`, creating runtime circular deps (those files import from `storeUtils.ts`).
- *Zustand `subscribe()` in root store* — would add async lag between mutation and persist; Zustand subscribe fires after state is committed but outside the action call.

---

## Decision 4: Pure Selector Functions (not Zustand computed)

**Decision**: Derived state (group activation badge, active snippet count, is-active checks) is computed in pure functions in `src/store/selectors.ts`. Components import the selector and call it with store values.

**Rationale**: Zustand 5 has no built-in "computed/derived state" primitive. The alternative (computing inline in JSX) violates SC-001. Pure functions are the simplest approach — independently testable, zero store dependency, consistent with Constitution V (simplest correct approach).

**Alternatives considered**:
- *Zustand `subscribeWithSelector` + derived atoms* — unnecessary complexity for what is simple arithmetic over existing state.
- *Inline in store actions* — would require actions to return values, which is not the Zustand action pattern.

---

## Decision 5: `GroupsListItem.tsx` Dead Code Removal

**Decision**: Unused variables (`toggleGroup`, `deleteGroup`, `renameOpen`, `handleRename`, `openRename`) that existed in the original `GroupsListItem.tsx` were removed during the refactor. The rename/delete UI exists only in `FlowListItem.tsx`; `GroupsListItem` had scaffolded but unwired code.

**Rationale**: Constitution I requires dead code removal. Since the file was being rewritten to use selectors, the dead code was cleaned in the same commit. The UI capabilities (rename/delete group) remain accessible via existing store actions for future wiring.

**Alternatives considered**:
- *Leave dead code in place* — rejected; constitution violation, and the file was already being touched.

---

## File Inventory (implementation complete)

| File | Key Exports | Role |
|------|-------------|------|
| `src/types/index.ts` | `Snippet`, `Group`, `Library`, `Flow`, `OutputSettings`, `AppState`, `StoreData` | Data model + typing bridge for slices |
| `src/store/useAppStore.ts` | `useAppStore`, `StoreState` | Root store: composes all slices, owns `persist()` |
| `src/store/useGroups.ts` | `GroupsSlice`, `createGroupsSlice` | Library + selectedGroupId CRUD |
| `src/store/useSnippets.ts` | `SnippetsSlice`, `createSnippetsSlice` | Snippet CRUD + reorder |
| `src/store/useFlows.ts` | `FlowsSlice`, `createFlowsSlice` | Flow CRUD + activation toggles |
| `src/store/useSettings.ts` | `SettingsSlice`, `createSettingsSlice` | Output settings |
| `src/store/selectors.ts` | `GroupActivationState`, `selectGroup*`, `selectIsGroup*`, `selectIsSnippet*` | Pure derived-state selectors |
| `src/store/utils/storeUtils.ts` | `cleanFlowsOnGroupDelete`, `cleanFlowsOnSnippetDelete`, `reindexSnippetOrder` | Cross-slice pure utilities |
| `src/components/GroupsListItem.tsx` | — | Updated: uses selectors, dead code removed |
