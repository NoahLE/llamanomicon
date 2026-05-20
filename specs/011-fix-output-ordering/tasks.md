# Tasks: Fix Output Window Snippet Ordering

**Input**: Design documents from `specs/011-fix-output-ordering/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Summary**: 5 surgical file edits — no new files, no new dependencies, no new data model fields.
The root cause is that three display paths call `sortByName` instead of reading `agent.activeOrder`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Establish a passing baseline before making changes

- [X] T001 Run `npm test` and confirm all existing tests pass; note any pre-existing failures so they are not attributed to this fix

---

## Phase 2: Foundational

**Purpose**: No blocking prerequisites exist for this bug fix — all three user story phases can begin after T001

> This phase is intentionally empty. The fixes are independent edits to separate files (compiler, selectors, component). No new modules, entities, or shared infrastructure are required.

**Checkpoint**: T001 complete → all three user story phases (Phase 3, 4, 5) may proceed

---

## Phase 3: User Story 1 — Active Snippets Appear in Output in Panel Order (Priority: P1) 🎯 MVP

**Goal**: The Output window accordion shows active snippets within each skill group in `activeOrder` sequence, not alphabetically.

**Independent Test**: Activate snippets "Zebra" then "Alpha" (both tagged "Writing") on an agent. Open the Output window and expand "Writing" — Zebra must appear before Alpha. No changes to Snippets panel display required to validate this story.

### Implementation for User Story 1

- [X] T002 [P] [US1] Fix snippet ordering in `selectSkillGroupsForOutput` inner `getActiveSnippetsForSkill` function: replace `sortByName(result)` with `result.sort((a, b) => agent.activeOrder.indexOf(a.id) - agent.activeOrder.indexOf(b.id))` in `src/store/useAgents.ts`

- [X] T003 [P] [US1] Fix snippet ordering in `src/lib/compiler.ts`: (a) add `activeOrder: string[]` parameter to `getActiveSnippetsForSkill`; (b) replace `return sortByName(result)` with `return result.sort((a, b) => activeOrder.indexOf(a.id) - activeOrder.indexOf(b.id))`; (c) pass `agent.activeOrder` at both call sites inside `compileOutputBySkillGroup`; (d) replace `sortByName(untaggedSnippets)` with `untaggedSnippets.sort((a, b) => agent.activeOrder.indexOf(a.id) - agent.activeOrder.indexOf(b.id))`

- [X] T004 [US1] Update `src/lib/tests/compiler.test.ts`: (a) rename test "single group emits all active snippets alphabetically by name" → "single group emits active snippets in activeOrder sequence" and set `activeOrder: ["a2", "a1"]` to assert A2 before A1 (non-alphabetical); (b) add test: agent with two snippets in a skill group, `activeOrder` reversed from alphabetical, assert output respects `activeOrder`

- [X] T005 [US1] Add `selectSkillGroupsForOutput` ordering tests to `src/store/tests/useAgents.test.ts`: (a) test: snippets activated in reverse-alphabetical order → skill group contains them in activation order; (b) test: multi-skill snippet appears once, at its first-group position, in `activeOrder` sequence

**Checkpoint**: T002–T005 complete → run `npx vitest run src/lib/tests/compiler.test.ts src/store/tests/useAgents.test.ts` — all tests pass; Output window shows correct ordering

---

## Phase 4: User Story 2 — Drag-and-Drop Reorder Reflected in Both Panels (Priority: P1)

**Goal**: Drag-and-drop in the Snippets panel immediately updates the display order in both the Snippets panel and the Output window.

**Independent Test**: Activate snippets A, B, C on an agent (all same skill). Drag C to the top. Snippets panel must show C → A → B. Output window must show C → A → B inside the skill group.

### Implementation for User Story 2

- [X] T006 [P] [US2] Fix `selectAllSnippets` and `selectUntaggedSnippets` in `src/store/useSnippets.ts`: replace single `sortByName([...])` call in each function with the two-list approach — split snippets into `active` (sorted by `agent.activeOrder` index) and `inactive` (sorted alphabetically), return `[...active, ...inactive]`; when no agent is active, fall back to full alphabetical sort

- [X] T007 [P] [US2] Fix `selectSnippetsForSkill` in `src/store/useSkills.ts`: replace `sortByName(result)` with the two-list approach — split into `active` (ordered by `agent.activeOrder` index) and `inactive` (alphabetical), return `[...active, ...inactive]`; when no agent is active, fall back to alphabetical; call `selectActiveAgent(storeState)` to get the agent (already imported)

- [X] T008 [US2] Fix `handleDragEnd` in `src/components/Snippets.tsx`: replace the current `arrayMove(...).filter(id => activeAgent.activeSet.has(id))` + `reorderSnippets(agentId, reordered)` with the positional-splice algorithm from `specs/011-fix-output-ordering/plan.md` Phase 1 Fix 5 — compute `newActiveViewOrder` (active IDs in new drag order), find their positions in `agent.activeOrder`, replace values at those positions, call `reorderSnippets(activeAgent.id, newActiveOrder)` with the full merged array

- [X] T009 [US2] Add ordering tests to `src/store/tests/useSnippets.test.ts`: (a) test: `selectAllSnippets` with active agent returns active snippets in `activeOrder` order, inactive snippets alphabetically after; (b) test: `selectAllSnippets` with no active agent returns all snippets alphabetically; (c) test: `selectUntaggedSnippets` with active agent returns untagged active snippets in `activeOrder` order followed by untagged inactive alphabetically

- [X] T010 [US2] Add ordering test to `src/store/tests/useSkills.test.ts`: test: `selectSnippetsForSkill` with active agent returns active snippets in `activeOrder` order, inactive snippets alphabetically after; verify non-alphabetical `activeOrder` produces non-alphabetical result

**Checkpoint**: T006–T010 complete → run `npx vitest run src/store/tests/useSnippets.test.ts src/store/tests/useSkills.test.ts` — all tests pass; manual drag-and-drop in dev server updates both panels immediately

---

## Phase 5: User Story 3 — Inactive Snippets Remain Stable in Snippets Panel (Priority: P2)

**Goal**: When active snippets are reordered via drag-and-drop, inactive snippets remain at a consistent, predictable position (alphabetical tail) and are not lost or reordered.

**Independent Test**: Create snippets A (active), B (inactive), C (active). Drag C above A. Panel shows C → A → B (B stays at the bottom, alphabetical among inactive). Activating B appends it after C and A.

> **Note**: The display behaviour (inactive snippets appear alphabetically after active) is already implemented by T006 and T007. This phase adds specific regression tests for that contract.

### Implementation for User Story 3

- [X] T011 [US3] Add inactive-stability test to `src/store/tests/useSnippets.test.ts`: test: three snippets where two are active and one is inactive; call `reorderSnippets` to swap the active snippets; assert `selectAllSnippets` returns the two active snippets in their new order followed by the inactive snippet in alphabetical position

- [X] T012 [US3] Add inactive-stability test to `src/store/tests/useSkills.test.ts`: test: same scenario scoped to a single skill — reorder active snippets within the skill; assert `selectSnippetsForSkill` preserves inactive snippet at the tail in alphabetical order

**Checkpoint**: T011–T012 complete → run `npm test` — full suite passes; all three user stories independently verifiable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates and documentation update

- [X] T013 [P] Run `make lint` in the repo root and fix any ESLint or Prettier issues introduced by the changes

- [X] T014 [P] Run `make build` to confirm zero TypeScript errors across the full project (strict mode + `noUncheckedIndexedAccess`)

- [X] T015 Update `CLAUDE.md` "Recent Changes" section: add entry `011-fix-output-ordering: snippet ordering within skill groups now driven by agent.activeOrder; Snippets panel displays active snippets in activeOrder order followed by inactive alphabetically`

- [X] T016 Execute the manual verification scenarios in `specs/011-fix-output-ordering/quickstart.md` against the running dev server (`make dev`) and confirm all expected outcomes match

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Empty — no blocking work
- **US1 (Phase 3)**: After T001 — T002 and T003 are independent of each other [P]
- **US2 (Phase 4)**: After T001 — T006 and T007 are independent of each other [P]; T008 depends on T006/T007 completing (panel display must be correct before verifying DnD feedback)
- **US3 (Phase 5)**: After T006 and T007 (tests verify behaviour introduced there)
- **Polish (Phase 6)**: After all implementation tasks complete; T013 and T014 can run in parallel [P]

### User Story Dependencies

- **US1 (P1)**: Independent — output window fix only; no dependency on US2
- **US2 (P1)**: Independent — panel display + DnD fix; no dependency on US1
- **US3 (P2)**: Depends on US2 (T006, T007) for the display behaviour it tests

---

## Parallel Opportunities

```text
# After T001, launch US1 and US2 work simultaneously:

US1 track:
  T002  Fix selectSkillGroupsForOutput in src/store/useAgents.ts
  T003  Fix getActiveSnippetsForSkill in src/lib/compiler.ts
  ↓ (both complete)
  T004  Update src/lib/tests/compiler.test.ts
  T005  Add tests to src/store/tests/useAgents.test.ts

US2 track (parallel with US1):
  T006  Fix src/store/useSnippets.ts  ──┐
  T007  Fix src/store/useSkills.ts    ──┤ all [P]
                                        ↓ (both complete)
  T008  Fix handleDragEnd in src/components/Snippets.tsx
  T009  Add tests to src/store/tests/useSnippets.test.ts
  T010  Add test to src/store/tests/useSkills.test.ts

US3 track (after T006, T007):
  T011  Inactive-stability test in src/store/tests/useSnippets.test.ts
  T012  Inactive-stability test in src/store/tests/useSkills.test.ts

Polish (after all implementation):
  T013  make lint   ──┐ [P]
  T014  make build  ──┘
  T015  Update CLAUDE.md
  T016  Run quickstart.md scenarios
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001)
2. Complete Phase 3 (T002–T005)
3. **STOP and VALIDATE**: Output window now shows correct ordering — the most visible bug is fixed
4. Demo: activate snippets in non-alphabetical order; Output window reflects activation order

### Incremental Delivery

1. T001 → baseline confirmed
2. T002–T005 → Output window ordering fixed (US1 ✅)
3. T006–T010 → Snippets panel + DnD fixed (US2 ✅)
4. T011–T012 → Inactive snippet stability verified (US3 ✅)
5. T013–T016 → Polish and documentation complete

---

## Notes

- [P] tasks edit different files and have no dependency on each other within the same phase
- US1 and US2 are fully independent — both can start after T001
- No new files are created; all tasks are edits to existing files
- `sortByName` is intentionally kept for: agent list display, skill list display, and skill group ordering (these are correct alphabetical sorts) — only the within-group snippet sort is being changed
- The `indexOf`-based sort (`activeOrder.indexOf(id)`) runs in O(n) per comparison on the array, which is acceptable for the expected data scale (hundreds of snippets at most)
- Commit after each task or logical group; each commit must pass `make lint`
