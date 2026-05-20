# Tasks: Skills Section Modal Refactor

**Input**: Design documents from `/specs/007-skills-modal-refactor/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup

**Purpose**: Orientation — no new packages or scaffolding required. This refactor is a surgical replacement within the existing project.

- [x] T001 Confirm working branch is `007-skills-modal-refactor` and `make dev` starts cleanly at http://localhost:5173

---

## Phase 2: Foundational — Store Fix

**Purpose**: Fix `activeSkillId` initialization and `deleteSkill` cascade. These two changes are required before the new component can behave correctly. All user stories depend on them.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 In `src/store/useSkills.ts` line 68, change `activeSkillId: null` to `activeSkillId: UNTAGGED_SKILL_ID` so the store initializes with Untagged active
- [x] T003 In `src/store/useSkills.ts` line 111 (inside `deleteSkill`), change the ternary fallback from `null` to `UNTAGGED_SKILL_ID` so deleting the active skill reverts to Untagged instead of null

**Checkpoint**: `activeSkillId` is now always a string. `null` is never set by the store. Run `make lint` to confirm no type errors.

---

## Phase 3: User Story 1 — View and Activate a Skill (Priority: P1) 🎯 MVP

**Goal**: The Skills panel renders all skills in a Listbox with Untagged pinned at top. Clicking a skill activates it. Clicking the already-active skill does nothing. Untagged is active by default on load.

**Independent Test**: Open app → "Untagged" is highlighted. Click a named skill → it highlights and Snippets panel updates. Click same skill again → no change. Confirm `useAppStore.getState().activeSkillId` in browser console.

- [x] T004 [US1] Create `src/components/Skills.tsx` with `AppSection` wrapper (title="Skills"), HeroUI `ListBox` (selectionMode="single", disallowEmptySelection=true), a pinned `ListBox.Item` with id={UNTAGGED\_SKILL\_ID} labelled "Untagged" (no edit/delete actions), and mapped `ListBox.Item` entries for each skill from `selectSortedSkills`
- [x] T005 [US1] Wire selection in `src/components/Skills.tsx`: `selectedKeys` is `new Set([activeSkillId ?? UNTAGGED_SKILL_ID])`; `onSelectionChange` calls `setActiveSkillId` only when the incoming key differs from the current `activeSkillId`
- [x] T006 [US1] Replace `<SkillsList />` with `<Skills />` in the app layout file (find current usage with `grep -r "SkillsList" src/`) — update the import, keep surrounding layout unchanged

**Checkpoint**: App renders Skills panel. "Untagged" is active on load. Clicking skills activates them. Clicking the active skill does nothing. `make lint` passes.

---

## Phase 4: User Story 2 — View Active Snippet Count per Skill (Priority: P1)

**Goal**: Each skill item shows its active snippet count for the current agent. The Untagged item shows its own count. Counts update when the active agent changes.

**Independent Test**: With an agent selected and some snippets activated, verify each skill's count reflects the current agent's active set. Switch agents and verify counts update immediately.

- [x] T007 [US2] In `src/components/Skills.tsx`, add active count to the Untagged `ListBox.Item` description using `selectUntaggedSnippetCount` (import from `@/store/useSnippets`); display the `active` field in a `Description` sub-element
- [x] T008 [US2] In `src/components/Skills.tsx`, add active count to each named skill `ListBox.Item` description; derive all counts in a single `useAppStore(useShallow(...))` call that maps skill IDs to `{ active, total }` via `selectSnippetCountForSkill`, then look up each skill's count inside `skills.map()`

**Checkpoint**: Each skill item shows a count. Switching agents updates all counts. `make lint` passes.

---

## Phase 5: User Story 3 — Add a Skill via Modal (Priority: P2)

**Goal**: An add button in the Skills panel header opens an `AppFormModal`. Submitting a non-empty name creates the skill and closes the modal.

**Independent Test**: Click the add button → modal opens with name field. Enter a name and submit → modal closes, new skill appears in alphabetical order. Submit with empty name → skill is not created.

- [x] T009 [US3] In `src/components/Skills.tsx`, add `AppFormModal` (triggerIcon="add", headerText="Add Skill", fields={skillFormFields}) as the `controls` prop to `AppSection`; `onSave` calls `addSkill(values.name)` only when `values.name` is non-empty (import `skillFormFields` from `@/lib/formFields`)

**Checkpoint**: Add flow works end-to-end. New skill appears in sorted list. `make lint` passes.

---

## Phase 6: User Story 4 — Edit a Skill Name via Modal (Priority: P2)

**Goal**: Each named skill item has an edit button that opens an `AppFormModal` pre-populated with the current name. Submitting renames the skill in place.

**Independent Test**: Click edit on a skill → modal opens with name pre-filled. Change name and submit → modal closes, list shows updated name. Cancel → no change.

- [x] T010 [US4] In `src/components/Skills.tsx`, add `AppFormModal` (triggerIcon="edit", headerText="Edit Skill", fields={skillFormFields}, initialValues=\{\{ name: skill.name \}\}) inside each named skill `ListBox.Item`; `onSave` calls `updateSkill(skill.id, { name: values.name })` only when non-empty; wrap in a `<div className="flex flex-row">` alongside the delete button (added next phase)

**Checkpoint**: Edit flow works. Skill name updates in list without page reload. `make lint` passes.

---

## Phase 7: User Story 5 — Delete a Skill (Priority: P3)

**Goal**: Each named skill item has a delete button. Clicking it removes the skill and cascades to snippets. If the deleted skill was active, Untagged becomes active.

**Independent Test**: Click delete on a skill → skill disappears from list. If it was active, Untagged is now highlighted. Any snippets previously tagged with it no longer reference it (verify in store state).

- [x] T011 [US5] In `src/components/Skills.tsx`, add a `Button` (isIconOnly, size="sm") with `<Trash2 size={12} />` inside each named skill `ListBox.Item` alongside the edit modal; `onClick` calls `deleteSkill(skill.id)` (import `Trash2` from `lucide-react`, `Button` from `@heroui/react`)

**Checkpoint**: Delete flow works. Deleted active skill reverts to Untagged. `make lint` passes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Remove old files, add test coverage for the new component and updated store, update documentation.

- [x] T012 [P] Delete `src/components/SkillsList.tsx` (replaced by Skills.tsx — FR-013)
- [x] T013 [P] Delete `src/components/SkillsListItem.tsx` (replaced by Skills.tsx — FR-013)
- [x] T014 [P] Delete `src/components/SkillsListItemEdit.tsx` (replaced by Skills.tsx — FR-013)
- [x] T015 [P] Delete `src/components/tests/SkillsList.test.tsx` (test file for deleted component)
- [x] T016 [P] Delete `src/components/tests/SkillsListItem.test.tsx` (test file for deleted component)
- [x] T017 Write `src/components/tests/Skills.test.tsx` covering: US1 activation (click skill → active, click active skill → no change), US2 count display updates on agent switch, US3 add modal creates skill, US4 edit modal renames skill, US5 delete removes skill and reverts to Untagged when active (use `createTestStore` + RTL, AAA pattern, tests/ subdir convention)
- [x] T018 Update `src/store/tests/useSkills.test.ts` to assert: `activeSkillId` initializes to `UNTAGGED_SKILL_ID`; `deleteSkill` on active skill reverts `activeSkillId` to `UNTAGGED_SKILL_ID`
- [x] T019 Update `CLAUDE.md` "Recent Changes" to reflect that `Skills.tsx` replaces the three-file SkillsList family and that `activeSkillId` no longer initializes to `null`
- [x] T020 Run `make lint` and `make build` to confirm zero TypeScript errors, zero ESLint warnings, and a clean production build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Story phases (3–7)**: All depend on Phase 2; each story phase depends on the previous (all touch `Skills.tsx`)
- **Polish (Phase 8)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: First after Foundational — creates `Skills.tsx`; wires layout
- **US2 (P1)**: Depends on US1 — adds count display to existing items
- **US3 (P2)**: Depends on US1 — adds modal to existing header controls
- **US4 (P2)**: Depends on US1 (and US3 for layout positioning) — adds edit modal to items
- **US5 (P3)**: Depends on US1 (and US4 for layout positioning) — adds delete button to items

> **Note**: US3–US5 all modify the same `Skills.tsx` file. Work them sequentially on a single branch to avoid conflicts.

### Parallel Opportunities

- T002 and T003 (store fixes) can be applied in the same edit pass
- T012–T016 (file deletions in Phase 8) can all run in parallel
- T017 and T018 (test files) can be written in parallel — different files

---

## Parallel Example: Phase 8 Deletions

```bash
# All five deletion tasks can be done together:
Task T012: rm src/components/SkillsList.tsx
Task T013: rm src/components/SkillsListItem.tsx
Task T014: rm src/components/SkillsListItemEdit.tsx
Task T015: rm src/components/tests/SkillsList.test.tsx
Task T016: rm src/components/tests/SkillsListItem.test.tsx

# Then in parallel:
Task T017: Write src/components/tests/Skills.test.tsx
Task T018: Update src/store/tests/useSkills.test.ts
```

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational store fix (T002, T003)
3. Complete Phase 3: US1 — activation works (T004–T006)
4. Complete Phase 4: US2 — counts visible (T007–T008)
5. **STOP and VALIDATE**: App works for the core loop (view, activate, see counts)

### Incremental Delivery

1. Foundation + US1 → Skills panel renders and activates skills
2. + US2 → Active counts visible per skill
3. + US3 → Skills can be added via modal
4. + US4 → Skills can be renamed via modal
5. + US5 → Skills can be deleted
6. Polish phase → old files removed, tests added, docs updated

---

## Notes

- `Skills.tsx` grows incrementally across phases 3–7 — always a single file
- Per-item snippet counts require a `useShallow` selector in the parent; avoid calling `useAppStore` inside `skills.map()` directly (hooks cannot be called inside callbacks)
- The `disallowEmptySelection` prop on HeroUI `ListBox` prevents deselection by clicking the active item — verify this behavior handles "click active skill → no change" before writing manual click guards
- Commit after each phase checkpoint; each commit should pass `make lint`
- No design CSS is added at any phase — structural Tailwind from AppSection/AppFormModal/Listbox only
