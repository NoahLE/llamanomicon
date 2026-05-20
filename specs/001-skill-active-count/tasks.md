# Tasks: Skill Active Snippet Count

**Input**: Design documents from `specs/001-skill-active-count/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Tests**: Included — plan.md explicitly gates on testing (Constitution Principle VI) and spec.md defines testable acceptance scenarios for each user story.

**Organization**: Grouped by user story to enable independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

No new project structure needed — this feature adds to existing files only. No setup tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the two derived selectors that all three user stories depend on. These must exist before any component work begins.

**⚠️ CRITICAL**: All user story phases depend on these selectors being complete.

- [x] T001 Add `selectSnippetCountForSkill(state, skillId): { active: number; total: number }` selector to `src/store/useSkills.ts` — computes active count for a named skill using `snippetsBySkill` and `activeAgent.activeSet`; returns `{ active: 0, total: snippetsBySkill.get(skillId)?.size ?? 0 }` when no agent is selected
- [x] T002 [P] Add `selectUntaggedSnippetCount(state): { active: number; total: number }` selector to `src/store/useSnippets.ts` — computes active count for the Untagged virtual row by filtering `draft.snippets` for entries where `skills.size === 0`; returns `active: 0` when no agent is selected
- [x] T003 [P] Add unit tests for `selectSnippetCountForSkill` to `src/store/tests/useSkills.test.ts` covering: no agent selected (active=0, total=N), agent with 0 active snippets (0/N), partial active (k/N), all active (N/N), skill with zero tagged snippets (0/0)
- [x] T004 [P] Add unit tests for `selectUntaggedSnippetCount` to `src/store/tests/useSnippets.test.ts` covering: no agent selected (active=0), all snippets tagged (total=0, active=0), mix of tagged and untagged with no active, partial active untagged snippets

**Checkpoint**: Both selectors exist and are unit-tested. Component work can begin.

---

## Phase 3: User Story 1 — View Active Counts in Skill List (Priority: P1) 🎯 MVP

**Goal**: Every skill row in the Skills List panel (including Untagged) shows `(active/total)` alongside its name.

**Independent Test**: Open the app with an agent selected and snippets tagged to skills. Each skill row in the Skills List panel displays a `(active/total)` count that matches the actual active snippet state.

### Implementation for User Story 1

- [x] T005 [US1] Subscribe to `selectSnippetCountForSkill` in `src/components/SkillsListItem.tsx` using `useAppStore(useShallow((state) => selectSnippetCountForSkill(state, skill.id)))`
- [x] T006 [US1] Render the count as `<span className="text-xs text-muted shrink-0">({count.active}/{count.total})</span>` after the skill name `<span>` in the flex row in `src/components/SkillsListItem.tsx`
- [x] T007 [US1] Subscribe to `selectUntaggedSnippetCount` in `src/components/SkillsList.tsx` using `useAppStore(useShallow(selectUntaggedSnippetCount))` at the top of the component
- [x] T008 [US1] Render the count span `({untaggedCount.active}/{untaggedCount.total})` after the "Untagged" text span in the Untagged row within `src/components/SkillsList.tsx`
- [x] T009 [P] [US1] Create `src/components/tests/SkillsListItem.test.tsx` with component tests verifying: count renders with correct `(active/total)` text when the store has a skill with known active/total values; count renders `(0/N)` when no snippets are active; count renders `(0/0)` when skill has no tagged snippets

**Checkpoint**: All skill rows display counts. US1 fully functional and independently testable.

---

## Phase 4: User Story 2 — Count Updates Live on Toggle (Priority: P2)

**Goal**: Activating or deactivating a snippet immediately updates the count on the corresponding skill row without page reload.

**Independent Test**: Toggle a snippet on/off in the Snippets Panel while watching the Skills List — the count increments/decrements in the same render cycle.

### Implementation for User Story 2

> No new implementation required — Zustand's reactive subscriptions handle this automatically once Phase 3 is complete. This phase consists entirely of tests that verify the reactive behavior works correctly.

- [x] T010 [US2] Add a store-level integration test to `src/store/tests/useSkills.test.ts` that calls `activateSnippet` on the store and asserts `selectSnippetCountForSkill` returns the incremented active count; then calls `deactivateSnippet` and asserts it decrements
- [x] T011 [P] [US2] Add a component integration test to `src/components/tests/SkillsListItem.test.tsx` that renders `SkillsListItem` with an initial store state, activates a snippet via the store, and asserts the rendered count text updates to the new value

**Checkpoint**: Tests confirm live reactivity. US2 verified.

---

## Phase 5: User Story 3 — Count Reflects Active Agent (Priority: P3)

**Goal**: Switching agents updates all skill row counts to reflect the newly selected agent's active set.

**Independent Test**: Create two agents with different active snippets for the same skill; switch between them and verify the count changes to match each agent's state.

### Implementation for User Story 3

> No new implementation required — counts derive from `selectActiveAgent` which reads `activeAgentId`. Switching agents updates this, triggering re-renders automatically. This phase is tests only.

- [x] T012 [US3] Add a store-level integration test to `src/store/tests/useSkills.test.ts` that creates two agents with different active snippet sets for the same skill, switches `activeAgentId` between them, and asserts `selectSnippetCountForSkill` returns the correct counts for each agent
- [x] T013 [P] [US3] Add a component integration test to `src/components/tests/SkillsListItem.test.tsx` that renders with Agent A selected (e.g. active=2), switches to Agent B (active=0) via the store, and asserts the rendered count text changes accordingly

**Checkpoint**: Tests confirm agent-scoped counts. All three user stories verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 [P] Update `CLAUDE.md` Key Selectors section to document `selectSnippetCountForSkill` (in `useSkills.ts`) and `selectUntaggedSnippetCount` (in `useSnippets.ts`)
- [x] T015 [P] Update `docs/state-and-data-flow.md` to document the count selector pattern alongside existing selector documentation
- [x] T016 Run `make lint` and verify no TypeScript errors or ESLint violations introduced by any changed file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **User Stories (Phases 3–5)**: All depend on Phase 2 (T001, T002) being complete
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. Core visual change — required for US2 and US3 to be observable
- **US2 (P2)**: Depends on US1 being complete (tests validate US1's reactive behavior)
- **US3 (P3)**: Depends on US1 being complete (tests validate US1's agent-scoping behavior)

### Within Each Phase

- T001 before T005, T006, T007, T008 (selectors required before component usage)
- T002 before T007, T008 (untagged selector required before Untagged row usage)
- T003, T004 can be written in parallel with T005–T008 (different files)
- T005 before T006 (subscription before render — same file, sequential)
- T007 before T008 (subscription before render — same file, sequential)
- T009 after T006 and T008 (component must render count before testing it)
- T010, T011 after T006 and T008 (reactive behavior needs UI to exist)
- T012, T013 after T010 (agent-switch builds on the reactive patterns from US2)

### Parallel Opportunities

- T002, T003, T004 can all start simultaneously (different files, no dependencies on each other)
- T003 and T004 (selector tests) can be written while T005–T008 (component updates) are in progress
- T009 and T010 can be worked on simultaneously (different files)
- T011 and T012 can be worked on simultaneously (different files)
- T014 and T015 can be written simultaneously (different files)

---

## Parallel Example: Phase 2 + Phase 3 Overlap

```bash
# After T001 and T002 are done:

# Track 1 — component work (sequential within track):
Task T005: "Subscribe to selectSnippetCountForSkill in src/components/SkillsListItem.tsx"
Task T006: "Render count span in src/components/SkillsListItem.tsx"
Task T007: "Subscribe to selectUntaggedSnippetCount in src/components/SkillsList.tsx"
Task T008: "Render count span in Untagged row in src/components/SkillsList.tsx"

# Track 2 — store tests (runs in parallel with Track 1):
Task T003: "Add unit tests for selectSnippetCountForSkill in src/store/tests/useSkills.test.ts"
Task T004: "Add unit tests for selectUntaggedSnippetCount in src/store/tests/useSnippets.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: T001, T002 (selectors)
2. Complete Phase 3: T005–T008 (component rendering), optionally T009
3. **STOP and VALIDATE**: Open the app, confirm every skill row shows a count
4. Ship US1 if time-boxed

### Full Delivery (All Stories)

1. Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
2. Each phase adds verified behavior without breaking previous

---

## Notes

- [P] tasks = different files or no shared state, can be done in any order relative to each other
- US2 and US3 have no new implementation — they are test coverage for emergent reactive behavior from US1
- `useShallow` is required at every `selectSnippetCountForSkill` / `selectUntaggedSnippetCount` call site (returns object — shallow equality prevents unnecessary re-renders)
- `src/store/selectors.ts` does not exist and must NOT be created — selectors live in their owning slice files
- Commit after each task or logical group; each commit must pass `make lint`
- Total tasks: 16 | Foundational: 4 | US1: 5 | US2: 2 | US3: 2 | Polish: 3
