# Tasks: Inline Store Selectors and Index Utilities

**Input**: Design documents from `/specs/006-inline-selectors/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, contracts/store-exports.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Confirm the baseline is green before any refactor begins.

- [x] T001 Run `npm test` and confirm all tests pass with zero failures (baseline checkpoint)

---

## Phase 2: User Story 1 — Selectors Migrated into Domain Stores (Priority: P1) 🎯 MVP

**Goal**: Every selector from `src/store/selectors.ts` is moved to the owning slice file. All component imports are updated. `selectors.ts` is deleted.

**Independent Test**: `src/store/selectors.ts` does not exist; `npm test` passes; `grep -r "from.*store/selectors" src/` returns zero results.

### Implementation

- [x] T002 [P] [US1] Add `sortByName` helper (2-line private function) and export `selectActiveAgent`, `selectSortedAgents` to `src/store/useAgents.ts`
- [x] T003 [P] [US1] Add `sortByName` helper and export `UNTAGGED_SKILL_ID`, `selectSelectedSkill`, `selectSortedSkills`, `selectSnippetsForSkill` to `src/store/useSkills.ts`
- [x] T004 [P] [US1] Add `sortByName` helper and export `selectUntaggedSnippets`, `selectAllSnippets` to `src/store/useSnippets.ts`
- [x] T005 [P] [US1] Inline `createSelectors` type and function body directly into `src/store/useAppStore.ts`; remove `import { createSelectors } from "./selectors"`
- [x] T006 [US1] Add `selectCompiledOutput` export to `src/store/useSettings.ts`; import `selectActiveAgent` from `./useAgents` (depends on T002)
- [x] T007 [P] [US1] Update `src/components/AgentList.tsx`: change `selectSortedAgents` import to `@/store/useAgents`
- [x] T008 [P] [US1] Update `src/components/SkillsList.tsx`: change `selectSortedSkills` and `UNTAGGED_SKILL_ID` imports to `@/store/useSkills`
- [x] T009 [US1] Update `src/components/OutputWindow.tsx`: change `selectActiveAgent` import to `@/store/useAgents`; change `selectCompiledOutput` import to `@/store/useSettings` (depends on T002, T006)
- [x] T010 [US1] Delete `src/store/selectors.ts` (depends on T002–T009 all complete)

**Checkpoint**: US1 complete — `selectors.ts` gone, all component imports updated, `npm test` passes.

---

## Phase 3: User Story 2 — Index Utility Migrated into Data Controls (Priority: P2)

**Goal**: `buildSnippetsBySkill` moves from `src/lib/indexes.ts` into `src/store/useDataControls.ts` as a module-private function. `indexes.ts` is deleted.

**Independent Test**: `src/lib/indexes.ts` does not exist; `grep -r "from.*lib/indexes" src/` returns zero results; all index rebuild operations still work correctly.

### Implementation

- [x] T011 [US2] Add `buildSnippetsBySkill` as a module-private (unexported) function at the top of `src/store/useDataControls.ts`; remove `import { buildSnippetsBySkill } from "@/lib/indexes"`
- [x] T012 [US2] Delete `src/lib/indexes.ts` (depends on T011)

**Checkpoint**: US2 complete — `indexes.ts` gone, `useDataControls.ts` self-contained, `npm test` passes.

---

## Phase 4: User Story 3 — Tests Updated (Priority: P2)

**Goal**: All test files that imported from `selectors.ts` or `indexes.ts` are updated. `selectors.test.ts` is replaced by per-slice test cases. `indexes.test.ts` is deleted.

**Independent Test**: `npm test` passes with zero failures; no test file imports from `selectors.ts` or `lib/indexes`.

**Prerequisites**: Phase 2 (US1) and Phase 3 (US2) must be complete — source files must exist at new locations before tests can import from them.

### Implementation

- [x] T013 [P] [US3] Append `selectActiveAgent` and `selectSortedAgents` test cases (ported from `selectors.test.ts`) to `src/store/tests/useAgents.test.ts`
- [x] T014 [P] [US3] Append `selectSelectedSkill`, `selectSortedSkills`, `selectSnippetsForSkill` test cases to `src/store/tests/useSkills.test.ts`
- [x] T015 [P] [US3] Append `selectUntaggedSnippets`, `selectAllSnippets` test cases to `src/store/tests/useSnippets.test.ts`
- [x] T016 [P] [US3] Append `selectCompiledOutput` test cases to `src/store/tests/useSettings.test.ts`
- [x] T017 [US3] Rewrite `src/components/tests/testUtils.ts`: replace single `import * as selectors` with four per-module namespace imports (`useAgents`, `useSkills`, `useSnippets`, `useSettings`); update all `vi.spyOn` calls accordingly (depends on T013–T016 to confirm new exports exist)
- [x] T018 [US3] Delete `src/store/tests/selectors.test.ts` (depends on T013–T016 — all cases must be ported first)
- [x] T019 [US3] Delete `src/lib/tests/indexes.test.ts` (function is now private; behavior covered by store action tests)

**Checkpoint**: US3 complete — no test file references deleted modules, `npm test` passes.

---

## Phase 5: User Story 4 — Documentation Updated (Priority: P3)

**Goal**: All doc files that reference `selectors.ts` or `indexes.ts` reflect the new locations.

**Independent Test**: `grep -r "selectors\.ts\|indexes\.ts" docs/ CLAUDE.md` returns zero results.

### Implementation

- [x] T020 [P] [US4] Update `docs/architecture.md`: replace references to `selectors.ts` with the owning slice files per the migration table in `contracts/store-exports.md`
- [x] T021 [P] [US4] Update `docs/state-and-data-flow.md`: replace selector-location descriptions to reference the new slice files; update `indexes.ts` reference to `useDataControls.ts`
- [x] T022 [P] [US4] Update `CLAUDE.md` Key Selectors section: note that selectors live in their respective slice files, not in a central `selectors.ts`

**Checkpoint**: US4 complete — docs accurate, no stale file references.

---

## Phase 6: Polish & Final Verification

**Purpose**: Confirm the entire refactor is clean end-to-end.

- [x] T023 Run `npm test` — confirm zero failures across store tests and component tests
- [x] T024 Run `make lint` — confirm ESLint + Prettier clean with no unused imports or variables
- [x] T025 Run `make build` — confirm TypeScript type-check passes and production build succeeds
- [x] T026 [P] Verify `grep -r "from.*store/selectors" src/` returns zero results
- [x] T027 [P] Verify `grep -r "from.*lib/indexes" src/` returns zero results
- [x] T028 [P] Verify `ls src/store/selectors.ts src/lib/indexes.ts` reports both files absent

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run first to confirm baseline
- **Phase 2 (US1) + Phase 3 (US2)**: Depend on Phase 1 only; can run **in parallel with each other**
- **Phase 4 (US3)**: Depends on both Phase 2 AND Phase 3 — new module exports must exist before test imports can be updated
- **Phase 5 (US4)**: Depends only on Phase 1; doc changes are independent of code changes
- **Phase 6 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Start immediately after Phase 1 baseline check
- **US2 (P2)**: Start immediately after Phase 1 baseline check — independent of US1
- **US3 (P2)**: Blocked by US1 + US2 — test imports must resolve to existing exports
- **US4 (P3)**: Independent of all other stories — can run in parallel with US1/US2

### Within Phase 2 (US1)

```text
T002, T003, T004, T005 → all parallel (different destination files)
T006 → depends on T002 (needs selectActiveAgent from useAgents)
T007, T008 → parallel (different component files)
T009 → depends on T002, T006 (needs both imports resolved)
T010 → depends on all of T002–T009 (delete only after all imports updated)
```

### Within Phase 4 (US3)

```text
T013, T014, T015, T016 → all parallel (different test files)
T017 → can start once T002–T006 exist (new exports confirmed)
T018 → depends on T013–T016 (all cases ported)
T019 → independent (function private; delete safe after T012)
```

---

## Parallel Execution Example: Phase 2 (US1)

```text
# Launch these four together (different files, no dependencies):
T002: Add selectors to src/store/useAgents.ts
T003: Add selectors to src/store/useSkills.ts
T004: Add selectors to src/store/useSnippets.ts
T005: Inline createSelectors into src/store/useAppStore.ts

# Then:
T006: Add selectCompiledOutput to src/store/useSettings.ts  (after T002)
T007: Update src/components/AgentList.tsx                    (after T002)
T008: Update src/components/SkillsList.tsx                   (after T003)
T009: Update src/components/OutputWindow.tsx                 (after T002 + T006)

# Finally:
T010: Delete src/store/selectors.ts                          (after all above)
```

## Parallel Execution Example: Phase 4 (US3)

```text
# Launch all four test file updates together:
T013: Append cases to src/store/tests/useAgents.test.ts
T014: Append cases to src/store/tests/useSkills.test.ts
T015: Append cases to src/store/tests/useSnippets.test.ts
T016: Append cases to src/store/tests/useSettings.test.ts

# Then:
T017: Rewrite src/components/tests/testUtils.ts mocks
T018: Delete src/store/tests/selectors.test.ts
T019: Delete src/lib/tests/indexes.test.ts
```

---

## Implementation Strategy

### MVP (US1 alone)

1. Phase 1: Baseline check (T001)
2. Phase 2: US1 implementation (T002–T010)
3. **Validate**: `npm test` + `grep` checks + `selectors.ts` absent
4. This alone satisfies the primary request — the file is gone

### Full Delivery (All Stories)

1. Phase 1 → Phase 2 (US1) + Phase 3 (US2) in parallel → Phase 4 (US3) → Phase 5 (US4) → Phase 6 (Polish)
2. Each phase checkpoint validates independently before proceeding

---

## Task Count Summary

| Phase | Story | Tasks | Parallelizable |
|-------|-------|-------|----------------|
| Phase 1: Setup | — | 1 | 0 |
| Phase 2: US1 | Migrate selectors.ts | 9 | 6 |
| Phase 3: US2 | Migrate indexes.ts | 2 | 0 |
| Phase 4: US3 | Update tests | 7 | 4 |
| Phase 5: US4 | Update docs | 3 | 3 |
| Phase 6: Polish | — | 6 | 3 |
| **Total** | | **28** | **16** |
