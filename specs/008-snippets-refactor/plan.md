# Implementation Plan: Snippets Panel Component Refactor

**Branch**: `008-snippets-refactor` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-snippets-refactor/spec.md`

## Summary

Consolidate `SnippetsPanel.tsx` + `SnippetsPanelItem.tsx` into a single `SnippetsPanel.tsx` that matches the established Agent/Skills component pattern: AppFormModal in the header for adding snippets, a HeroUI ListBox for rendering items, per-item edit (AppFormModal) and delete buttons, and snippet name + truncated text description per row. All inline editing is removed. Drag-and-drop reordering is preserved. No new styling or design code is introduced.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, `noUncheckedIndexedAccess: true`)  
**Primary Dependencies**: React 19, HeroUI (ListBox, Button, Avatar, Label, Description), @dnd-kit/react 0.3.2 (DragDropProvider, useSortable), Zustand 5, Lucide React  
**Storage**: N/A — component-only change; store unchanged  
**Testing**: Vitest 4 + React Testing Library; test file at `src/components/tests/SnippetsPanel.test.tsx`  
**Target Platform**: Browser (PWA, dark-first)  
**Project Type**: Web application (frontend only — single-panel component refactor)  
**Performance Goals**: 60 fps; no new renders beyond existing snippet list updates  
**Constraints**: No new design code; no store changes; no new dependencies  
**Scale/Scope**: Single component rewrite + expanded test suite

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle              | Check                                                                                                  | Status |
|------------------------|--------------------------------------------------------------------------------------------------------|--------|
| I. Code Quality        | TypeScript strict, no `any`; `SnippetsPanelItem.tsx` deleted (dead code removal); single responsibility per unit | ✅ |
| II. UX Consistency     | Dark-first preserved via HeroUI defaults; no new motion patterns; interaction matches Agent/Skills panels | ✅ |
| III. Performance       | No new dependencies; no blocking state mutations; ListBox renders are local-state-only changes          | ✅ |
| IV. Living Documentation | `CLAUDE.md` "Recent Changes" section updated in same PR; no docs/ changes required (component-only refactor) | ✅ |
| V. Simplicity & DRY    | Consolidating two files into one reduces complexity; AppFormModal and snippetFormFields reused without modification | ✅ |
| VI. Testing Discipline | Test file at `src/components/tests/SnippetsPanel.test.tsx`; AAA pattern; mock-based isolation; expanded coverage | ✅ |
| Tech Standards         | HeroUI ListBox, dnd-kit sortable, Zustand selectors, Lucide icons — all established patterns             | ✅ |
| V1 Scope Gate          | No node graph, no GSAP, no neoskeumorphic design                                                        | ✅ |

No violations — Complexity Tracking section omitted.

## Project Structure

### Documentation (this feature)

```text
specs/008-snippets-refactor/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (affected files only)

```text
src/components/
├── SnippetsPanel.tsx          ← rewritten (consolidates SnippetsPanelItem)
├── SnippetsPanelItem.tsx      ← DELETED
└── tests/
    └── SnippetsPanel.test.tsx ← expanded test coverage
```

No other source files are modified.

**Structure Decision**: Single-project layout (existing). Only `src/components/` is touched. No new directories.

---

## Phase 0: Research

### R-001 — updateSnippet store action

**Decision**: `updateSnippet(id, patch: Partial<Pick<Snippet, "name" | "text">>)` already supports updating both name and text.  
**Rationale**: Inspected `src/store/useSnippets.ts` lines 44–50. The type signature accepts both fields; no store changes are required.  
**Alternatives considered**: None — store is already complete.

### R-002 — snippetFormFields definition

**Decision**: `snippetFormFields` already exists in `src/lib/formFields.ts` with `name` (text input) and `text` (textfield) entries.  
**Rationale**: Inspected `src/lib/formFields.ts` lines 43–58. Both fields are defined; no formFields changes are required.  
**Alternatives considered**: None.

### R-003 — HeroUI ListBox + dnd-kit useSortable integration

**Decision**: Pass the `useSortable` `ref` directly to each `ListBox.Item` component. HeroUI components are built on React Aria primitives and support ref forwarding in React 19. If ref forwarding is unavailable on `ListBox.Item` at implementation time, the fallback is a thin sortable `div` wrapper around each `ListBox.Item` with no styling (preserving FR-011 no-new-design-code constraint).  
**Rationale**: The existing `SnippetsPanelItem.tsx` attaches `useSortable`'s `ref` to an outer `div`. The new ListBox.Item renders as an `li`; passing the ref directly is the simplest approach. The `handleRef` (drag-handle grip) remains on an inner element within the item.  
**Alternatives considered**:  
- Full custom list (no ListBox): rejected — violates FR-004.  
- Removing drag-and-drop for this refactor: rejected — violates FR-006.

### R-004 — Multi-select snippet toggling in ListBox

**Decision**: Use `selectionMode="multiple"` on the ListBox with `selectedKeys` mapped from `activeAgent?.activeSet`. The `onSelectionChange` handler computes the diff against the current `activeSet` and calls `activateSnippet` / `deactivateSnippet` per changed ID.  
**Rationale**: The current toggle logic is per-item `onClick`. Moving to ListBox's native selection model (`selectionMode="multiple"`) is the idiomatic HeroUI pattern and removes the need for custom toggle event handling on each item.  
**Alternatives considered**:  
- Keep custom `onClick` toggle per item inside ListBox: works but bypasses ListBox selection state, causing visual desyncs.

### R-005 — Snippet item display fields

**Decision**: Each `ListBox.Item` renders `<Label>{snippet.name}</Label>` as the primary label and `<Description>{snippet.text.slice(0, 60)}{snippet.text.length > 60 ? "…" : ""}</Description>` as the truncated text preview. Truncation at 60 characters matches the existing aria-label truncation in `SnippetsPanelItem.tsx` (line 90).  
**Rationale**: Consistent with Agent.tsx (Label + Description) and Skills.tsx (Label + Description) patterns. Truncation limit sourced from existing code.  
**Alternatives considered**: None — spec FR-010 is explicit.

### R-006 — Test mock structure for SnippetsPanel

**Decision**: Follow the same hoisted-mock pattern established in `src/components/tests/Skills.test.tsx`. Mock `@/store/useAppStore` with a `use` accessor object, mock `zustand/react/shallow`, and mock the relevant selectors. Mock `@dnd-kit/react` and `@dnd-kit/react/sortable` to avoid DOM environment issues with drag sensors.  
**Rationale**: The existing SnippetsPanel test is a single smoke test. The Skills test pattern provides a proven template for testing HeroUI ListBox-based components with Zustand.  
**Alternatives considered**: Real store via `createTestStore` — viable but heavier; mock approach is sufficient for component-level tests and matches the established pattern.

---

## Phase 1: Design

### data-model.md

No data model changes. The `Snippet` entity already has `name: string` and `text: string` fields. `updateSnippet` already accepts both. See [data-model.md](./data-model.md).

### contracts/

Not applicable. This is a purely internal UI component refactor with no external interfaces.

### Component Design: SnippetsPanel.tsx

```text
SnippetsPanel
├── AppSection title="Snippets" controls={addSnippetModal}
│   └── addSnippetModal = AppFormModal(triggerIcon="add", snippetFormFields, onSave→addSnippet)
│
└── [empty state] if snippets.length === 0: "No snippets yet"
│
└── DragDropProvider onDragEnd→handleDragEnd
    └── ListBox
          selectionMode="multiple"
          selectedKeys = activeAgent?.activeSet ?? empty Set
          onSelectionChange → compute diff, call activateSnippet/deactivateSnippet
        │
        └── [for each snippet]
            ListBox.Item ref={sortableRef} id={snippet.id} textValue={snippet.name}
            ├── [drag handle] div ref={handleRef} → GripVertical icon
            ├── Label → snippet.name
            ├── Description → snippet.text truncated to 60 chars
            ├── AppFormModal triggerIcon="edit" initialValues={name,text} onSave→updateSnippet
            └── Button isIconOnly → Trash2 → deleteSnippet
```

**Key behaviors**:
- `useSortable({ id, index })` called per item inside the map; `ref` passed to `ListBox.Item`
- No local `useState` for editing (inline editing removed entirely)
- `adding`, `newName`, `newText` state variables from old implementation removed
- `arrayMove` utility retained (needed for reorderSnippets call in handleDragEnd)
- `handleRef` attached to the grip-icon div inside each item (same as current)

### Invariants preserved from current implementation

| Behavior | Mechanism |
|----------|-----------|
| Drag-to-reorder within active agent | DragDropProvider + useSortable + reorderSnippets |
| Multi-snippet activation | ListBox selectionMode="multiple" + selectedKeys from activeSet |
| Cascade delete | deleteSnippet (store handles agent cascade) |
| Skill-filtered display | activeSkillId selector logic unchanged |
| Empty state | Conditional render when snippets.length === 0 |
| No-op when no active agent | activateSnippet/deactivateSnippet guard on activeAgent |

### Test Design: SnippetsPanel.test.tsx

Tests to write (AAA, isolated, mock-based):

| Test | User Story | Description |
|------|-----------|-------------|
| T-001 | US4 | Renders snippet name and truncated text in each ListBox item |
| T-002 | US4 | Renders empty state when no snippets |
| T-003 | US1 | Add button exists in panel header |
| T-004 | US2 | Edit button exists per snippet item |
| T-005 | US3 | Delete button calls deleteSnippet with correct id |
| T-006 | US4 | Active snippets reflected in ListBox selectedKeys |
| T-007 | US2 | No inline editing controls present on snippet items |

---

## Phase 1: Agent Context Update
