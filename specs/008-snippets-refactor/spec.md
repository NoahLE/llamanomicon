# Feature Specification: Snippets Panel Component Refactor

**Feature Branch**: `008-snippets-refactor`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "the agents.tsx and skills.tsx components have undergone a major refactor. the skills section needs to be updated to include these refactors as well. these changes include adding the appformmodal to add snippets to the header, switching the snippets to a listbox component, and in the component adding a edit and remove button. the edit button should trigger the appformmodal in edit mode. these changes should consolidate all the components into a single one."

## Clarifications

### Session 2026-04-22

- Q: Should inline editing be removed entirely (the per-item textarea + save/cancel flow)? → A: Yes — inline editing is completely removed. All editing is done exclusively via the AppFormModal.
- Q: What information should each snippet ListBox item display? → A: Snippet name as the primary label; truncated snippet text as the description below it.
- Q: Should styling/design code be added during this refactor? → A: No — the refactor is purely functional. No new design or styling code is to be added.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add Snippet via Header Modal (Priority: P1)

A user wants to add a new snippet to the library. They click an "add" button in the Snippets Panel header, fill in the snippet name and text in a modal dialog, and save it.

**Why this priority**: The add-snippet flow is the most frequent action users perform and is the foundation for all other interactions. Aligning it with the established Agent/Skills pattern is the core of this refactor.

**Independent Test**: Can be fully tested by opening the Snippets Panel, clicking the add button in the header, filling out the modal form, saving, and verifying the snippet appears in the list.

**Acceptance Scenarios**:

1. **Given** the Snippets Panel is visible, **When** the user clicks the add button in the panel header, **Then** a modal dialog opens with name and text input fields.
2. **Given** the add modal is open with valid name and text entered, **When** the user clicks Save, **Then** the modal closes and the new snippet appears in the snippet list.
3. **Given** the add modal is open, **When** the user clicks Cancel or closes the modal, **Then** no snippet is created and the modal closes without changes.
4. **Given** the add modal is open with empty or whitespace-only fields, **When** the user clicks Save, **Then** the snippet is not created (consistent with existing validation behavior).

---

### User Story 2 - Edit Snippet via Modal (Priority: P2)

A user wants to update the name or text of an existing snippet. Each snippet row shows an edit button. Clicking it opens the AppFormModal pre-populated with the snippet's current name and text. There is no inline editing — the modal is the only way to modify a snippet.

**Why this priority**: Replaces the removed inline edit experience with the consistent modal pattern used by Agents and Skills.

**Independent Test**: Can be fully tested by clicking the edit button on any existing snippet, modifying a field, saving, and confirming the snippet reflects the updated values.

**Acceptance Scenarios**:

1. **Given** the Snippets Panel shows at least one snippet, **When** the user clicks the edit button on that snippet, **Then** a modal opens pre-populated with the snippet's current name and text.
2. **Given** the edit modal is open with modifications made, **When** the user clicks Save, **Then** the modal closes and the snippet reflects the updated values.
3. **Given** the edit modal is open, **When** the user clicks Cancel, **Then** the snippet remains unchanged and the modal closes.
4. **Given** a snippet item is displayed, **When** the user interacts with the item outside of the edit/delete buttons, **Then** no inline editing mode is triggered (toggling is the only direct item interaction).

---

### User Story 3 - Delete Snippet via Remove Button (Priority: P3)

A user wants to remove a snippet. Each snippet row shows a delete button. Clicking it immediately removes the snippet from the list.

**Why this priority**: Deletion already exists but needs to be re-implemented within the new single-component structure. It is lower priority than add/edit since it is a destructive action users perform less frequently.

**Independent Test**: Can be fully tested by clicking the delete button on a snippet and confirming the snippet no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** a snippet exists in the list, **When** the user clicks the delete button on that snippet, **Then** the snippet is immediately removed from the list.
2. **Given** the deleted snippet was active for the current agent, **When** deleted, **Then** it is also removed from the agent's active set (cascade delete behavior is preserved).

---

### User Story 4 - Snippets Displayed as ListBox (Priority: P1)

Snippets are rendered using the standard ListBox component pattern (matching Agents and Skills panels) rather than custom div-based list items. Each snippet item shows its name as the primary label, a truncated preview of the snippet text as a secondary description, an activation indicator, and action buttons (edit, delete).

**Why this priority**: This is the structural change that enables all other stories and achieves visual/behavioral consistency across all panels.

**Independent Test**: Can be tested independently by verifying the snippet list renders using the ListBox component and each item displays correctly.

**Acceptance Scenarios**:

1. **Given** snippets exist, **When** the Snippets Panel is displayed, **Then** all snippets are rendered as items within a ListBox component, each showing the snippet name and a truncated text preview.
2. **Given** an agent is active, **When** a snippet is toggled, **Then** the selection state updates correctly within the ListBox.
3. **Given** a snippet is active for the current agent, **When** the panel renders, **Then** the snippet item shows a visual active/selected state.

---

### User Story 5 - Single Consolidated Component (Priority: P2)

All snippet panel functionality (list display, add modal, edit modal, delete, drag-and-drop) lives in a single `SnippetsPanel.tsx` file. The separate `SnippetsPanelItem.tsx` file is removed.

**Why this priority**: Reduces cognitive overhead and file count, mirroring the Skills refactor pattern where multiple files were collapsed into one.

**Independent Test**: Can be verified by confirming `SnippetsPanelItem.tsx` no longer exists and all functionality continues to work from `SnippetsPanel.tsx` alone.

**Acceptance Scenarios**:

1. **Given** the refactor is complete, **When** reviewing the component files, **Then** `SnippetsPanelItem.tsx` no longer exists as a standalone file.
2. **Given** the single file refactor, **When** all features (add, edit, delete, toggle, drag-and-drop) are exercised, **Then** they all function correctly.

---

### Edge Cases

- What happens when there are no snippets? The empty state message ("No snippets yet") should still be shown.
- What happens when a user opens the edit modal and clears the text field? The save should be rejected (field validation — both name and text are required).
- What happens when drag-and-drop reordering is active while the edit modal is open? The modal interaction should take precedence; reordering should not affect open modals.
- What happens when a snippet is deleted while it is being displayed in the active agent's output? The output should update immediately (cascade behavior preserved).
- What happens when no agent is active? Snippet toggle interactions are disabled or no-op; add/edit/delete operations remain available since snippets are independent entities.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Snippets Panel header MUST include an "add" button that opens the AppFormModal to create a new snippet with name and text fields.
- **FR-002**: Each snippet list item MUST include an edit button that opens the AppFormModal pre-populated with the snippet's current name and text.
- **FR-003**: Each snippet list item MUST include a delete/remove button that immediately removes the snippet.
- **FR-004**: The snippet list MUST be rendered using the ListBox component, consistent with the Agent and Skills panels.
- **FR-005**: All snippet panel functionality MUST be consolidated into a single `SnippetsPanel.tsx` file, eliminating `SnippetsPanelItem.tsx`.
- **FR-006**: Drag-and-drop reordering of snippets within an active agent MUST be preserved in the refactored component.
- **FR-007**: Snippet activation/deactivation toggling for the active agent MUST be preserved in the refactored component.
- **FR-008**: The empty state display ("No snippets yet") MUST be preserved when no snippets exist.
- **FR-009**: Inline editing (per-item textarea with save/cancel controls) MUST be completely removed. The AppFormModal is the sole mechanism for creating and modifying snippets.
- **FR-010**: Each snippet ListBox item MUST display the snippet name as the primary label and a truncated preview of the snippet text as a secondary description.
- **FR-011**: This refactor is purely functional. No new styling or design code is to be introduced. Existing styles are preserved only where needed for structural correctness; HeroUI component defaults are used for all new elements.

### Key Entities

- **Snippet**: A text fragment with a name and body. Displayed in the ListBox; can be toggled active/inactive per agent, reordered, created via modal, edited via modal, and deleted.
- **AppFormModal**: Reusable modal dialog component used for both create (triggerIcon="add") and edit (triggerIcon="edit") modes, accepting `fields`, `initialValues`, and `onSave` props.
- **SnippetsPanel**: The single consolidated component that owns all snippet-related UI and interactions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All snippet CRUD operations (add, edit, delete) are accessible within two interactions from the Snippets Panel — consistent with the Agent and Skills panels.
- **SC-002**: The snippet panel is implemented in a single component file with no sibling component files for sub-items.
- **SC-003**: All existing snippet behaviors (toggle, drag-and-drop, cascade delete, empty state) continue to function correctly after the refactor, with no regressions.
- **SC-004**: The add, edit, and delete interactions in the Snippets Panel are visually and behaviorally consistent with the same interactions in the Agents and Skills panels.
- **SC-005**: No inline editing controls (textarea, save button, cancel button per item) are present anywhere in the Snippets Panel after the refactor.
- **SC-006**: No new CSS classes, style attributes, or design tokens are introduced by this change.

## Assumptions

- Drag-and-drop reordering (via `@dnd-kit/react`) is preserved in the refactored component. The ListBox component and DragDropProvider integrate as needed.
- The `snippetFormFields` definition already exists in `src/lib/formFields.ts` (name + text fields) and will be used directly by both the add and edit modals.
- The edit modal updates both `name` and `text` fields on a snippet.
- The "Untagged" virtual filter entry is not shown in the Snippets Panel (it belongs to the Skills Panel filter). Snippets Panel shows snippets filtered by the currently active skill.
- No confirmation dialog is shown before deleting a snippet (matches current behavior and Agent/Skills patterns).
- Adding, editing, and deleting snippets does not require an active agent — these operations are independent of agent selection state.
