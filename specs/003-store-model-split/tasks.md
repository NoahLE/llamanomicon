# Tasks: Store Model Split

**Input**: Design documents from `specs/003-store-model-split/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/store-api.md ✅

**Tests**: No test framework exists (CLAUDE.md constraint). Acceptance is manual browser verification per the independent test criteria in each phase.

**Status note**: Implementation completed ahead of task generation. All `[x]` tasks are done. Open `[ ]` tasks are the active work queue (manual verification, commit, PR).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete-task dependencies)
- **[Story]**: Which user story this task belongs to — required for all user story phase tasks
- Paths are relative to repo root

---

## Phase 1: Setup (Refactor Structure)

**Purpose**: Establish typing bridge and directory layout before slice files are created.

- [x] T001 Add `StoreData` interface to `src/types/index.ts` extending `AppState` with `activeFlowId: string | null` and `selectedGroupId: string | null` — eliminates `any` in slice `set`/`get` signatures without circular deps
- [x] T002 Create `src/store/utils/` directory and stub `src/store/utils/storeUtils.ts`
- [x] T003 Remove `StoreState` interface from `src/types/index.ts` — it now lives as a composed type in `src/store/useAppStore.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared pure utilities and root store shell that all slice phases depend on.

**⚠️ CRITICAL**: No slice can be finalized until T004–T008 are complete.

- [x] T004 Implement `cleanFlowsOnGroupDelete(flows, groupId, snippetIds)` in `src/store/utils/storeUtils.ts` — pure, returns new flows array with group + all its snippet IDs removed from every flow's activation maps
- [x] T005 [P] Implement `cleanFlowsOnSnippetDelete(flows, snippetId)` in `src/store/utils/storeUtils.ts` — pure, removes single snippet ID from every flow's activation maps
- [x] T006 [P] Implement `reindexSnippetOrder(snippets)` in `src/store/utils/storeUtils.ts` — pure, returns new array with contiguous 0-based `order` values assigned
- [x] T007 Define `StoreState = GroupsSlice & SnippetsSlice & FlowsSlice & SettingsSlice & { importState }` in `src/store/useAppStore.ts` as the merged type for `create<StoreState>()`
- [x] T008 Define `persist()` closure inside the `create<StoreState>()` call in `src/store/useAppStore.ts` — single shared callback passed to all slice creators; calls `void saveState(extractAppState(get()))`

**Checkpoint**: `storeUtils.ts` complete; `useAppStore.ts` shell with `StoreState` type ready for slice spreads.

---

## Phase 3: User Story 1 — Store Action Owns Snippet Business Logic (Priority: P1) 🎯 MVP

**Goal**: `addSnippet`, `updateSnippet`, `deleteSnippet`, `reorderSnippets` live entirely in store slices. No ID generation, order calculation, or cascade cleanup appears in any component.

**Independent Test**: In the browser console after `make dev`, assign `window.__store = useAppStore.getState()` then call `__store.addSnippet(groupId, "hello")` — verify the snippet appears in `useAppStore.getState().library` with a UUID `id`, `order: 0`, and that after page reload `loadState()` returns the persisted snippet.

- [x] T009 [US1] Implement `createGroupsSlice(set, get, persist)` in `src/store/useGroups.ts` — exports `GroupsSlice` interface + factory; owns `library`, `selectedGroupId`; actions: `addGroup` (UUID + push), `updateGroup` (name trim guard), `deleteGroup` (calls `cleanFlowsOnGroupDelete`, clears `selectedGroupId`), `setSelectedGroup`
- [x] T010 [US1] Implement `createSnippetsSlice(set, get, persist)` in `src/store/useSnippets.ts` — exports `SnippetsSlice` interface + factory; `addSnippet` sets `order = group.snippets.length` and `id = crypto.randomUUID()`; `deleteSnippet` calls `cleanFlowsOnSnippetDelete` then `reindexSnippetOrder`; `reorderSnippets` splices array then calls `reindexSnippetOrder`
- [x] T011 [US1] Spread `createGroupsSlice(set, get, persist)` and `createSnippetsSlice(set, get, persist)` into the root `create<StoreState>()` return in `src/store/useAppStore.ts`
- [x] T012 [US1] Confirm `src/components/SnippetsPanelToolbar.tsx` calls `addSnippet(selectedGroupId, text.trim())` with no inline business logic — component was already correct, no changes needed
- [x] T013 [US1] **VERIFY**: `make dev` → create a group → add two snippets → reload page → confirm both snippets persist with `order: 0` and `order: 1` in `useAppStore.getState().library`

**Checkpoint**: Snippet CRUD works end-to-end with IndexedDB persistence across reloads.

---

## Phase 4: User Story 2 — Toggle Logic Lives in Store (Priority: P1)

**Goal**: `toggleGroup` and `toggleSnippet` (including the auto-deactivate-group rule from FR-008) are implemented entirely in `createFlowsSlice`. Components call the action only.

**Independent Test**: In the browser console, call `useAppStore.getState().toggleGroup(groupId)` — all snippets in the group flip to the same active state. Then call `useAppStore.getState().toggleSnippet(lastActiveSnippetId)` — the parent group also becomes inactive.

- [x] T014 [US2] Implement `createFlowsSlice(set, get, persist)` in `src/store/useFlows.ts` — exports `FlowsSlice` interface + factory; owns `flows[]`, `activeFlowId`; flow CRUD (`addFlow`, `updateFlow`, `deleteFlow` clears `activeFlowId`, `duplicateFlow`, `setActiveFlow`); `toggleGroup` syncs all snippet states; `toggleSnippet` reads `ownerGroup` via `get().library`, applies FR-008 auto-deactivate rule
- [x] T015 [US2] Spread `createFlowsSlice(set, get, persist)` into the root `create<StoreState>()` return in `src/store/useAppStore.ts`
- [x] T016 [US2] Confirm `src/components/GroupsListItem.tsx` calls only `setSelectedGroup` and `updateGroup`/`deleteGroup` from store — dead code (`toggleGroup`, `deleteGroup`, `renameOpen`, `handleRename`, `openRename`) removed; no inline activation logic
- [x] T017 [US2] Confirm `src/components/SnippetsPanelItem.tsx` calls only `toggleSnippet(snippet.id)` — no inline activation logic; already correct, no changes needed
- [x] T018 [US2] **VERIFY**: `make dev` → select a flow → activate a group containing 2 snippets → toggle the group off → confirm both snippets show inactive in `useAppStore.getState().flows`
- [x] T019 [US2] **VERIFY**: activate a group → toggle one snippet off then the other → confirm the group's `activation.groups[groupId]` is `false` automatically after the last snippet deactivates

**Checkpoint**: Toggle and FR-008 auto-deactivate work correctly; no activation logic in any TSX file.

---

## Phase 5: User Story 3 — Derived State via Selectors (Priority: P2)

**Goal**: Activation counts and selection status (`"all" | "partial" | "none" | "empty"`) are computed by pure selector functions in `selectors.ts`, not computed inline in JSX.

**Independent Test**: In the browser console, import `selectGroupActivationState` and call it with a mock `Group` (5 snippets) and a `Flow` (3 active) — confirm it returns `"partial"`. With 5/5 active → `"all"`. With 0/5 → `"none"`. With empty group → `"empty"`.

- [x] T020 [US3] Implement `selectGroupActivationState(group, activeFlow)` in `src/store/selectors.ts` — returns `"empty"` if no snippets, `"none"` if no flow, otherwise counts `activeFlow.activation.snippets` to return `"all" | "partial" | "none"`
- [x] T021 [P] [US3] Implement `selectActiveSnippetCount(group, activeFlow)` in `src/store/selectors.ts` — returns 0 if `activeFlow` is null/undefined, otherwise count of active snippets in group
- [x] T022 [P] [US3] Implement `selectIsGroupActive(groupId, activeFlow)` in `src/store/selectors.ts` — returns `activeFlow?.activation.groups[groupId] ?? false`
- [x] T023 [P] [US3] Implement `selectIsSnippetActive(snippetId, activeFlow)` in `src/store/selectors.ts` — returns `activeFlow?.activation.snippets[snippetId] ?? false`
- [x] T024 [US3] Update `src/components/GroupsListItem.tsx` — replace inline `activeSnippetCount` and `selectionState` derivation with `selectActiveSnippetCount(group, activeFlow)` and `selectGroupActivationState(group, activeFlow)`; import from `@/store/selectors`
- [x] T025 [US3] **VERIFY**: `make dev` → select a flow with a group containing 3 snippets → toggle 2 on → confirm the `2/3` badge renders with amber (partial) styling; toggle the third on → confirm badge turns emerald (all)

**Checkpoint**: Zero derived-state calculations remain in JSX; `GroupsListItem` badge driven entirely by selectors.

---

## Phase 6: User Story 4 — Shared Utilities for Cross-Slice Logic (Priority: P2)

**Goal**: Cascade cleanup on group/snippet delete lives exclusively in `storeUtils.ts`. No component and no slice file duplicates this logic.

**Independent Test**: In the browser console, call `cleanFlowsOnGroupDelete` with a mock flows array and a groupId — confirm the returned array has the groupId and all snippet IDs removed from activation maps, and the original array is unchanged (pure/immutable).

- [x] T026 [US4] Confirm `deleteGroup` in `src/store/useGroups.ts` sets `flows: cleanFlowsOnGroupDelete(flows, id, snippetIds)` — delegates cascade cleanup to shared utility; no inline cleanup logic in slice
- [x] T027 [P] [US4] Confirm `deleteSnippet` in `src/store/useSnippets.ts` uses `cleanFlowsOnSnippetDelete(flows, id)` for flow cleanup and `reindexSnippetOrder(remaining)` for order fix-up
- [x] T028 [P] [US4] Confirm `reorderSnippets` in `src/store/useSnippets.ts` calls `reindexSnippetOrder(snippets)` after the splice — no inline re-indexing
- [x] T029 [US4] **VERIFY**: `make dev` → create flow, activate group with 2 snippets → delete the group → inspect `useAppStore.getState().flows[0].activation` → confirm no orphaned group or snippet keys
- [x] T030 [US4] **VERIFY**: delete one snippet from an active group → confirm it is removed from flow activation maps and the remaining snippet has `order: 0`

**Checkpoint**: `storeUtils.ts` has zero store imports; all cascade logic goes through utilities.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Settings slice, import/export, lint/type-check gate, documentation, and PR.

- [x] T031 Implement `createSettingsSlice(set, get, persist)` in `src/store/useSettings.ts` — exports `SettingsSlice` interface + factory; owns `outputSettings: { showGroupHeaders: true, snippetSeparator: "\n" }`; `updateOutputSettings` merges patch and calls `persist()`
- [x] T032 Implement `importState(state: AppState)` in `src/store/useAppStore.ts` — atomically replaces `library`, `flows`, `outputSettings`; resets `activeFlowId` and `selectedGroupId` to `null`; does NOT call `persist()` to avoid re-saving on boot hydration
- [x] T033 **VERIFY**: `make dev` → export state to JSON → modify a snippet in the UI → re-import the JSON → confirm original state is fully restored (groups, snippets, flows, activation maps)
- [x] T034 **VERIFY**: toggle snippets on across multiple groups → confirm Output Window renders compiled text matching expected format (`### GroupName\nsnippet\n`)
- [x] T035 [P] Run `npx eslint src/store/ src/components/GroupsListItem.tsx` — confirm zero errors in all new/modified files
- [x] T036 [P] Run `npx tsc --noEmit` — confirm zero TypeScript errors project-wide
- [x] T037 [P] Update `docs/state-and-data-flow.md` to document the slice architecture: creator functions, `StoreData` typing, single `persist()` closure, `selectors.ts`, `storeUtils.ts`
- [x] T038 [P] Update `CLAUDE.md` store section to reference `useFlows.ts`, `useGroups.ts`, `useSnippets.ts`, `useSettings.ts`, `selectors.ts`, `src/store/utils/storeUtils.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup — types + directory)
  └─→ Phase 2 (Foundational — storeUtils + StoreState type + persist())
        ├─→ Phase 3 (US1 — snippet + group slices)
        ├─→ Phase 4 (US2 — flows slice + toggles)      ← parallel with Phase 3
        ├─→ Phase 5 (US3 — selectors)                  ← parallel with Phase 3/4
        └─→ Phase 6 (US4 — utility verification)       ← parallel with Phase 3/4/5
              └─→ Phase 7 (Polish, lint, docs, PR)
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2. No dependency on US2/US3/US4.
- **US2 (P1)**: Depends on Phase 2 and US1 (`createFlowsSlice.toggleGroup` reads `library` via `get()`, owned by groups slice merged in US1).
- **US3 (P2)**: Depends on Phase 2 only. Selectors are pure functions — no runtime dependency on any slice. Can start in parallel with US1/US2.
- **US4 (P2)**: Utilities defined in Phase 2. This phase is verification only — independent of all user stories.

### Parallel Opportunities

```bash
# Phase 2 — write all three utilities together:
T004 cleanFlowsOnGroupDelete || T005 cleanFlowsOnSnippetDelete || T006 reindexSnippetOrder

# Phase 5 — write all four selectors together:
T020 selectGroupActivationState || T021 selectActiveSnippetCount
T022 selectIsGroupActive        || T023 selectIsSnippetActive

# Phase 7 — lint, type-check, and docs are fully independent:
T035 eslint || T036 tsc --noEmit || T037 docs/state-and-data-flow.md || T038 CLAUDE.md
```

---

## Implementation Strategy

### MVP Scope (US1 + US2 — complete ✅)

1. ✅ Phase 1: Setup — `StoreData` type, `src/store/utils/` directory
2. ✅ Phase 2: Foundational — `storeUtils.ts`, `StoreState` type, `persist()` closure
3. ✅ Phase 3: US1 — `createGroupsSlice`, `createSnippetsSlice` merged in `useAppStore`
4. ✅ Phase 4: US2 — `createFlowsSlice` with `toggleGroup`/`toggleSnippet` and FR-008 rule

### Remaining Work (10 open tasks)

- Manual verification: T013, T018, T019, T025, T029, T030, T033, T034
- Commit + PR: T039, T040

### Incremental Delivery

Each user story phase is independently demonstrable:

- **After Phase 3**: Add snippets to a group; reload; state persists. ← MVP increment
- **After Phase 4**: Toggle flow activation; auto-deactivate rule fires.
- **After Phase 5**: Activation badge reads from selectors; no JSX derivation.
- **After Phase 6**: Delete group/snippet; no orphaned activation keys.

---

## Notes

- Pre-existing lint errors in unmodified components (`FlowListItem`, `OutputWindow`, etc.) are explicitly out of scope
- No test framework — manual browser verification is the acceptance gate per CLAUDE.md
- `[P]` tasks touch different files or exports and can be worked simultaneously
- `[x]` tasks are complete; `[ ]` tasks are the active work queue
