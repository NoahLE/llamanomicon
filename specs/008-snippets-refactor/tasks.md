# Tasks: Snippets Panel Component Refactor

**Input**: Design documents from `/specs/008-snippets-refactor/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested — test tasks are not included. See plan.md §Test Design for T-001–T-007 guidance if tests are added later.

**Organization**: Tasks follow the rewrite sequence. The component is written incrementally — each phase adds a complete, testable capability on top of the previous.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to

## Path Conventions

All paths are relative to repo root (`src/components/`).

---

## Phase 1: Setup

**Purpose**: Remove the old sub-component and prepare the file for a clean rewrite.

- [x] T001 Delete `src/components/SnippetsPanelItem.tsx`
- [x] T002 Remove the `SnippetsPanelItem` import and all its usages from `src/components/SnippetsPanel.tsx` — the file will temporarily be non-functional until Phase 2 is complete

**Checkpoint**: SnippetsPanel.tsx no longer references SnippetsPanelItem; build may fail until Phase 2 is complete.

---

## Phase 2: Foundational — ListBox Skeleton + DnD

**Purpose**: Establish the new structural backbone. After this phase the panel renders snippets with correct toggle behaviour and drag-to-reorder — with no styling additions.

⚠️ **CRITICAL**: All later phases depend on this structure being in place.

- [x] T003 Rewrite `src/components/SnippetsPanel.tsx`: add all store hooks (`activeSkillId`, `snippets`, `activeAgent`, `activateSnippet`, `deactivateSnippet`, `addSnippet`, `updateSnippet`, `deleteSnippet`, `reorderSnippets`), the `arrayMove` helper, and the `handleDragEnd` function — preserving the exact same logic from the current file
- [x] T004 Add `AppSection` wrapper (title="Snippets") as the root element of the new `src/components/SnippetsPanel.tsx` — `controls` prop left empty for now
- [x] T005 Add HeroUI `ListBox` inside `AppSection` in `src/components/SnippetsPanel.tsx` with `selectionMode="multiple"`, `selectedKeys` mapped from `activeAgent?.activeSet ?? new Set()`, and `onSelectionChange` handler that computes the diff against the current `activeSet` and calls `activateSnippet` / `deactivateSnippet` for each changed ID
- [x] T006 Add the empty-state paragraph (`"No snippets yet"`) inside `src/components/SnippetsPanel.tsx` when `snippets.length === 0`, rendered above the `DragDropProvider` (matching current behaviour)
- [x] T007 Wrap the `ListBox` in `DragDropProvider onDragEnd={handleDragEnd}` inside `src/components/SnippetsPanel.tsx`
- [x] T008 Add per-item rendering inside the `ListBox` in `src/components/SnippetsPanel.tsx`: call `useSortable({ id: snippet.id, index: idx })` for each snippet, pass the returned `ref` to `ListBox.Item`, attach `handleRef` to an inner drag-grip `div` containing `<GripVertical size={13} />` — if `ListBox.Item` does not accept a ref, wrap each item in a plain `<div ref={ref}>` with no className
- [x] T009 Add `<Label>{snippet.name}</Label>` and `<Description>{snippet.text.slice(0, 60)}{snippet.text.length > 60 ? "…" : ""}</Description>` inside each `ListBox.Item` in `src/components/SnippetsPanel.tsx`
- [x] T010 Add `<ListBox.ItemIndicator />` at the end of each `ListBox.Item` in `src/components/SnippetsPanel.tsx` (matches Agent/Skills pattern)

**Checkpoint**: App renders the Snippets Panel as a ListBox. Snippets show name + truncated text. Toggle and drag-to-reorder work. No add/edit/delete buttons yet.

---

## Phase 3: User Story 1 + 4 — Add Snippet via Header Modal (Priority: P1) 🎯 MVP

**Goal**: User can create a new snippet from the panel header using the AppFormModal. Snippet appears immediately in the ListBox with name and text displayed.

**Independent Test**: Open Snippets Panel → click + button in header → fill name and text → Save → snippet appears in list with correct name and truncated text.

- [x] T011 [US1] Create the `addSnippetModal` element in `src/components/SnippetsPanel.tsx`: `<AppFormModal triggerIcon="add" headerText="Add Snippet" fields={snippetFormFields} onSave={(v) => v.name && v.text && addSnippet(v.name, v.text)} />`
- [x] T012 [US1] Pass `addSnippetModal` as the `controls` prop on `AppSection` in `src/components/SnippetsPanel.tsx`

**Checkpoint**: Header + button opens modal. Snippet is created on Save. Empty name/text is rejected. ListBox shows new snippet with name and description. US1 + US4 fully functional.

---

## Phase 4: User Story 2 — Edit Snippet via Modal (Priority: P2)

**Goal**: Each snippet item has an edit button that opens AppFormModal pre-populated with current name and text. Saving updates both fields.

**Independent Test**: Click edit button on a snippet → modal opens with correct pre-filled values → change name/text → Save → ListBox item reflects updated values immediately.

- [x] T013 [US2] Add `<AppFormModal triggerIcon="edit" headerText="Edit Snippet" fields={snippetFormFields} initialValues={{ name: snippet.name, text: snippet.text }} onSave={(v) => updateSnippet(snippet.id, { name: v.name, text: v.text })} />` inside each `ListBox.Item` in `src/components/SnippetsPanel.tsx`

**Checkpoint**: Each snippet item has an edit button. Modal pre-populates. Saving updates name and text. Cancel leaves snippet unchanged. No inline editing controls exist anywhere in the file.

---

## Phase 5: User Story 3 — Delete Snippet via Remove Button (Priority: P3)

**Goal**: Each snippet item has a delete button that immediately removes the snippet. Cascade delete (removal from agent active sets) is handled by the store.

**Independent Test**: Click delete button on a snippet → snippet disappears from the list immediately. If the snippet was active, it is removed from the agent's compiled output.

- [x] T014 [US3] Add `<Button isIconOnly size="sm" onClick={(e) => { e.stopPropagation(); deleteSnippet(snippet.id); }} aria-label={\`Delete "${snippet.name}"\`}><Trash2 size={12} /></Button>` inside each `ListBox.Item` alongside the edit modal in `src/components/SnippetsPanel.tsx`

**Checkpoint**: Each snippet item has a delete button. Clicking it removes the snippet from the list and from any agent's active set. US3 fully functional.

---

## Phase 6: User Story 5 — Consolidation Verification

**Goal**: Confirm the single-file constraint is satisfied and no inline editing remnants survive.

**Independent Test**: `SnippetsPanelItem.tsx` does not exist. `SnippetsPanel.tsx` compiles without error. No `useState` for editing flags, no inline textarea/save/cancel controls present.

- [x] T015 [US5] Verify `src/components/SnippetsPanelItem.tsx` no longer exists (deleted in T001); if it was not deleted, delete it now
- [x] T016 [US5] Scan `src/components/SnippetsPanel.tsx` and confirm there are no remaining inline-edit state variables (`editing`, `editText`, `adding`, `newName`, `newText`), no inline `<textarea>` elements, and no inline save/cancel `<button>` elements — remove any found
- [x] T017 [P] [US5] Verify no other file in `src/` still imports from `SnippetsPanelItem` by searching for the string `SnippetsPanelItem` across the codebase

**Checkpoint**: Single consolidated component. Zero inline editing. All five user stories functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T018 Run `make lint` and fix any ESLint / Prettier issues introduced in `src/components/SnippetsPanel.tsx`
- [x] T019 Run `make build` (type-check + production build) and fix any TypeScript errors
- [x] T020 Update the `## Recent Changes` section in `CLAUDE.md` to document the 008-snippets-refactor: `SnippetsPanel.tsx` replaces `SnippetsPanel.tsx` + `SnippetsPanelItem.tsx`; inline editing removed; AppFormModal used for add and edit; ListBox renders snippets with name label and truncated text description
- [x] T021 [P] Update `src/components/tests/SnippetsPanel.test.tsx` to replace the existing smoke test with the 7-test suite defined in plan.md §Test Design (T-001–T-007), following the mock pattern from `src/components/tests/Skills.test.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1+US4)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion — can start in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 2 completion — can start in parallel with Phases 3 and 4
- **Phase 6 (US5)**: Depends on Phases 3, 4, 5 being complete
- **Phase 7 (Polish)**: Depends on Phase 6

### User Story Dependencies

- **US4 + US1 (P1)**: Phase 2 required; US4 structure built in Phase 2, add-modal in Phase 3
- **US2 (P2)**: Phase 2 required; independent of US1
- **US3 (P3)**: Phase 2 required; independent of US1 and US2
- **US5 (P2)**: Requires US1 + US2 + US3 complete (all functionality present before confirming consolidation)

### Parallel Opportunities

Within Phase 2, T003–T010 are sequential (all in the same file). Within the user story phases, Phase 3 / Phase 4 / Phase 5 tasks could be done in any order after Phase 2 since they each add a single UI element to the same component.

### Within Each Phase

- All tasks within a phase target the same file; execute sequentially
- Commit after each phase checkpoint

---

## Parallel Example: User Story Phases

```text
After Phase 2 is complete, all three story phases are unblocked:

Phase 3 (US1): T011 → T012    [add modal in header]
Phase 4 (US2): T013            [edit modal per item]
Phase 5 (US3): T014            [delete button per item]

These can be applied in any order since they each touch
different JSX sections of the same file.
```

---

## Implementation Strategy

### MVP First (US4 + US1 — ListBox + Add)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T010) — ListBox rendering, DnD, toggle
3. Complete Phase 3: US1 (T011–T012) — add modal in header
4. **STOP and VALIDATE**: Panel renders snippets, toggle works, DnD works, add modal works
5. Ship MVP if needed

### Incremental Delivery

1. Phase 1 + 2 → snippets render as ListBox with DnD and toggle
2. Phase 3 → add snippet via modal (US1 + US4 ✅)
3. Phase 4 → edit snippet via modal (US2 ✅)
4. Phase 5 → delete snippet (US3 ✅)
5. Phase 6 → verify consolidation (US5 ✅)
6. Phase 7 → lint, build, docs

---

## Notes

- [P] tasks operate on different files and have no ordering dependency
- Every phase after Phase 2 adds exactly one UI feature; each is independently verifiable
- No new CSS classes, design tokens, or style attributes are to be introduced at any task
- If `ListBox.Item` ref forwarding fails at T008, apply the `<div ref={ref}>` wrapper fallback immediately — do not block other tasks
- T021 (tests) is marked [P] in Phase 7 as it can be written concurrently with T018–T020
