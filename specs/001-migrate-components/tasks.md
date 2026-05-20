---
description: "Task list for component store migration, testing, and documentation"
---

# Tasks: Component Store Migration & Testing

**Input**: Design documents from `/specs/001-migrate-components/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Install missing test dependencies required before any test files can be written.

- [X] T001 Install `jsdom` as devDependency — `npm install -D jsdom`
- [X] T002 Install `@testing-library/user-event` as devDependency — `npm install -D @testing-library/user-event`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Migrate the one remaining unmigrated component and re-enable the three disabled panels.
All user story work depends on this phase completing successfully.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [X] T003 Migrate `src/components/OutputWindow.tsx` — remove `// @ts-nocheck`, replace `s.library`, `s.flows`, and `s.activeFlowId` references with `useAppStore(selectCompiledOutput)` and `useAppStore(selectActiveAgent)`; remove the old `compileOutput(library, flow, settings)` call
- [X] T004 Update `src/App.tsx` — uncomment the `SkillsList`, `SnippetsPanel`, and `OutputWindow` imports and their JSX nodes; remove any stale commented-out imports
- [X] T005 Verify TypeScript — run `npx tsc --noEmit` and confirm zero errors and zero `@ts-nocheck` suppressions in any component file

**Checkpoint**: All four panels are present in source and the build is type-clean. User story work can begin.

---

## Phase 3: User Story 1 — All Panels Visible and Functional (Priority: P1) 🎯 MVP

**Goal**: Confirm all four panels render and respond to interaction in the running application.

**Independent Test**: Run `make dev`, open the app, verify all four panels appear without console errors, and confirm basic interactions (add agent, select agent, view output).

- [X] T006 [US1] Manual verification — run `make dev`, open `http://localhost:5173`, and confirm all four panels (Agent List, Skills List, Snippets Panel, Output Window) render without runtime errors or console warnings; follow the manual checklist in `specs/001-migrate-components/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and independently demonstrable.

---

## Phase 4: User Story 2 — Skills Filter Drives Snippet Visibility (Priority: P2)

**Goal**: Confirm skill selection in SkillsList filters the Snippets Panel correctly, including the Untagged virtual filter.

**Independent Test**: With seed data present, click a skill in the Skills List and verify only tagged snippets appear; click again to deselect; click Untagged to see untagged snippets only.

- [X] T007 [US2] Manual verification — with seed data, select a skill and confirm SnippetsPanel shows only snippets tagged with that skill; deselect to confirm all snippets return; select Untagged to confirm only untagged snippets appear

**Checkpoint**: User Story 2 skill filtering behavior is verified.

---

## Phase 5: User Story 3 — Output Window Reflects Active Snippet Order (Priority: P3)

**Goal**: Confirm OutputWindow updates when snippets are reordered, deactivated, or absent.

**Independent Test**: With multiple active snippets, reorder via drag-and-drop and verify the output text order changes; deactivate a snippet and verify it disappears from output; select an agent with no active snippets and verify the empty state.

- [X] T008 [US3] Manual verification — activate multiple snippets, drag-reorder them, and confirm OutputWindow text order updates; deactivate a snippet and confirm it is removed from output; create/select an agent with no active snippets and confirm the empty state renders without error

**Checkpoint**: User Story 3 output ordering behavior is verified.

---

## Phase 6: User Story 4 — Automated Tests Verify Panel Behavior (Priority: P4)

**Goal**: Write React Testing Library tests for all five components under `src/components/tests/`. Each test file must begin with `// @vitest-environment jsdom` and follow the AAA pattern using real store actions for setup.

**Independent Test**: Run `npm test` — all component tests pass with no failures and no skips.

- [X] T009 [P] [US4] Write `src/components/tests/AgentList.test.tsx` — include: (1) renders list of agents from store, (2) add-agent form submits and new agent appears, (3) clicking an agent sets it as active, (4) empty state when no agents exist
- [X] T010 [P] [US4] Write `src/components/tests/SkillsList.test.tsx` — include: (1) renders skills sorted alphabetically, (2) clicking a skill calls `setActiveSkillId`, (3) Untagged option appears and sets filter to null/untagged
- [X] T011 [P] [US4] Write `src/components/tests/SnippetsPanel.test.tsx` — include: (1) renders snippets for active agent's active skill filter, (2) toggling a snippet inactive calls `deactivateSnippet`, (3) toggling an inactive snippet active calls `activateSnippet`, (4) active agent references a snippet ID that no longer exists — panel renders without throwing
- [X] T012 [P] [US4] Write `src/components/tests/OutputWindow.test.tsx` — include: (1) renders compiled text of active agent's snippets in order, (2) deactivating a snippet removes its text from output, (3) no active agent renders empty state without throwing, (4) empty snippet separator (`""`) produces joined output without extra whitespace
- [X] T013 [P] [US4] Write `src/components/tests/DataControls.test.tsx` — include: (1) commit button calls `saveSession` and persists state, (2) discard button calls `discardSession` and reverts session to baseline
- [X] T014 [US4] Run `npm test` and confirm all component tests pass with zero failures and zero skips (depends on T009–T013)

**Checkpoint**: User Story 4 is complete — the automated test suite covers all panels.

---

## Phase 7: User Story 5 — Documentation Reflects Current Architecture (Priority: P5)

**Goal**: Update all project documentation to accurately describe the completed migration, with no stale references to the old architecture.

**Independent Test**: Read `docs/architecture.md` and `docs/state-and-data-flow.md` — no "pending migration" notes, no references to old `library`/`flows` API; read `docs/contributing.md` — component test instructions present.

- [X] T015 [P] [US5] Update `docs/architecture.md` — mark all four panels as implemented and fully migrated; remove any "pending" or "commented-out" notes; confirm component inventory table matches current `src/components/` directory
- [X] T016 [P] [US5] Update `docs/state-and-data-flow.md` — verify store slice list matches current `src/store/` files; confirm session model description (draft/baseline/commit/discard) is accurate; remove any references to old entity names (`library`, `flows`, `groups`)
- [X] T017 [P] [US5] Update `docs/contributing.md` — add a "Component Tests" section describing the `src/components/tests/` path convention, the `// @vitest-environment jsdom` per-file directive, and the `npm test` / `npm run test:watch` commands
- [X] T018 [US5] Update `CLAUDE.md` — add entry for branch `005-update-store-components` / `001-migrate-components` in Recent Changes describing the component migration and test suite; remove the `// @ts-nocheck` note from the **Note** line in the UI components section (depends on T015–T017)

**Checkpoint**: User Story 5 is complete — documentation is accurate and current.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates across all user stories.

- [X] T019 Run `make lint` and fix any ESLint or Prettier warnings introduced during the migration
- [X] T020 Run `make build` to confirm the production build completes without errors
- [X] T021 [P] Confirm `src/components/tests/` directory exists and contains exactly five test files matching the names of their source components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T001 and T002 run in parallel
- **Foundational (Phase 2)**: Requires Phase 1 complete (jsdom needed before test writing)
  - T003 and T004 can run in parallel (different files)
  - T005 depends on T003 and T004
- **US1 (Phase 3)**: Depends on Foundational — T006 depends on T005
- **US2 (Phase 4)**: Depends on Foundational — T007 can run in parallel with T006
- **US3 (Phase 5)**: Depends on Foundational — T008 can run in parallel with T006, T007
- **US4 (Phase 6)**: Depends on Foundational — T009–T013 can all run in parallel; T014 depends on T009–T013
- **US5 (Phase 7)**: Depends on Foundational — T015–T017 can run in parallel; T018 depends on T015–T017
- **Polish (Phase 8)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Foundational phase complete — independently verifiable
- **US2 (P2)**: Foundational phase complete — independently verifiable
- **US3 (P3)**: Foundational phase complete — independently verifiable
- **US4 (P4)**: Foundational phase complete — all 5 test files parallelizable
- **US5 (P5)**: Foundational phase complete — 3 doc files parallelizable

### Parallel Opportunities

```bash
# Phase 1 — both deps install in parallel:
npm install -D jsdom
npm install -D @testing-library/user-event

# Phase 2 — migrate and re-enable in parallel:
# → OutputWindow.tsx migration
# → App.tsx panel uncomment

# Phase 6 — all 5 test files in parallel:
# → AgentList.test.tsx
# → SkillsList.test.tsx
# → SnippetsPanel.test.tsx
# → OutputWindow.test.tsx
# → DataControls.test.tsx

# Phase 7 — 3 doc files in parallel:
# → docs/architecture.md
# → docs/state-and-data-flow.md
# → docs/contributing.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run dev server; confirm all four panels visible; zero console errors
5. App is fully functional — all subsequent phases add quality assurance and documentation

### Incremental Delivery

1. Setup + Foundational → All panels functional (MVP)
2. US2 verification → Skills filter confirmed working
3. US3 verification → Output ordering confirmed working
4. US4 tests → Regressions now caught automatically
5. US5 docs → Project documented for future contributors
6. Polish → Build and lint green

### Notes

- T003 is the only substantive code change — all other migration work is uncomment/verify
- T009–T013 can be assigned to different developers and merged independently
- Every test file is self-contained; write-and-run is immediate with `npm run test:watch`
- Commit after T005 (type-clean build) as a natural checkpoint before test writing begins
