# Feature Specification: Store Model Split

**Feature Branch**: `003-store-model-split`
**Created**: 2026-03-24
**Status**: Draft

## Clarifications

### Session 2026-03-24

- Q: Which slice structure does "zustand docs structure with flat functions" mean? → A: Slice creator functions — `createXxxSlice(set, get, persist)` files spread into one root `create<StoreState>()`. Each slice body is a flat object of state + actions. Matches the Zustand slice pattern.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Developer adds a snippet without touching component logic (Priority: P1)

A developer adding a new "add snippet" interaction writes only a component that calls a store action. No validation, ID generation, order calculation, or persistence logic appears in the component file.

**Why this priority**: This is the core architectural goal — components call actions, actions own logic.

**Independent Test**: Create a new snippet via the `addSnippet` store action directly; verify it appears in the library with correct order and the Dexie snapshot is updated — without any component rendering.

**Acceptance Scenarios**:

1. **Given** a group exists, **When** `addSnippet(groupId, text)` is called on the store, **Then** the snippet appears in the correct group with an auto-assigned order and a UUID, and state is persisted.
2. **Given** a component rendering the snippets panel, **When** the user clicks "Add Snippet", **Then** the component calls only the store action with no inline mutation or ID generation logic.

---

### User Story 2 — Developer toggles a group's activation state (Priority: P1)

Toggling a group on/off (and its downstream snippet sync) is handled entirely by a store action. The component calls `toggleGroup(groupId)` and re-renders.

**Why this priority**: Activation logic is the most complex business rule (auto-deactivate group when last snippet turns off); it must not live in a component.

**Independent Test**: Call `toggleGroup` on the store directly and verify all snippet activation states in the active flow are updated correctly.

**Acceptance Scenarios**:

1. **Given** a flow with a group that has 2 active snippets, **When** `toggleGroup(groupId)` is called to deactivate, **Then** both snippets in the flow are marked inactive.
2. **Given** the last active snippet in a group is toggled off via `toggleSnippet`, **Then** the parent group is automatically marked inactive in the active flow.

---

### User Story 3 — Developer queries derived state via selectors (Priority: P2)

A component that displays "3 of 5 snippets active" imports a selector from the store slice rather than computing this inline.

**Why this priority**: Eliminates duplicated derived-state logic spread across components.

**Independent Test**: Import the selector directly and call it with mock state; verify it returns the correct count.

**Acceptance Scenarios**:

1. **Given** a flow with 3 active snippets in a group of 5, **When** the group list item renders, **Then** the activation count is read from a store selector, not calculated in JSX.
2. **Given** a selector for group activation status (all/partial/none/empty), **When** called with different flow states, **Then** it returns the correct category.

---

### User Story 4 — Developer uses shared utilities for cross-slice logic (Priority: P2)

Logic that spans multiple slices (e.g., cleaning up flow references when a snippet is deleted) is placed in a utility module imported by the relevant slice.

**Why this priority**: Prevents duplication and keeps slice files focused.

**Independent Test**: Call the utility function with mock state; verify correct cross-slice cleanup without any store dependency.

**Acceptance Scenarios**:

1. **Given** a snippet is deleted, **When** `deleteSnippet` runs, **Then** a shared utility removes that snippetId from all flow activation maps.
2. **Given** a group is deleted, **When** `deleteGroup` runs, **Then** a shared utility removes the groupId and all its snippet IDs from all flows.

---

### Edge Cases

- Deleting the currently selected group clears `selectedGroupId`.
- Deleting the active flow sets `activeFlowId` to null or the next available flow.
- Importing state replaces all slices atomically without triggering double-persist.
- Reordering snippets recalculates `order` indices without leaving gaps.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The store MUST be organized into per-model slice files (`useFlows`, `useGroups`, `useSnippets`, `useSettings`), each exporting a `createXxxSlice(set, get, persist)` creator function following the Zustand slice pattern. All slices are spread into a single root `create<StoreState>()` call in `useAppStore`.
- **FR-002**: Each slice creator MUST return a flat object of state fields and action functions — no nested sub-objects grouping related actions. This matches the flat structure shown in Zustand documentation.
- **FR-003**: Shared cross-store logic (cleanup of foreign key references on delete) MUST live in utility modules, not inside component files.
- **FR-004**: TSX components MUST contain no business logic — only UI state (e.g., dialog open/close) and calls to store actions.
- **FR-005**: Derived state currently computed inline in components (activation counts, selection status) MUST be moved to store actions or selectors.
- **FR-006**: The root `useAppStore` MUST merge all slice creators so components can import from a single hook without changes to existing import lines.
- **FR-007**: All existing functionality (CRUD, toggle, reorder, import/export, compile) MUST continue to work after the refactor.
- **FR-008**: The auto-deactivate group logic (when last snippet is toggled off) MUST remain in the `useFlows` slice's `toggleSnippet` action, not in any component.
- **FR-009**: Persistence (Dexie save on state change) MUST be triggered via a single `persist()` closure inside the root `useAppStore` creator — not in components and not duplicated per slice.

### Key Entities

- **useFlows** (`createFlowsSlice`): owns `flows[]`, `activeFlowId`; flat actions: `addFlow`, `updateFlow`, `deleteFlow`, `duplicateFlow`, `setActiveFlow`, `toggleGroup`, `toggleSnippet`.
- **useGroups** (`createGroupsSlice`): owns `library`, `selectedGroupId`; flat actions: `addGroup`, `updateGroup`, `deleteGroup`, `setSelectedGroup`.
- **useSnippets** (`createSnippetsSlice`): flat actions: `addSnippet`, `updateSnippet`, `deleteSnippet`, `reorderSnippets` (operates on `library` owned by groups slice).
- **useSettings** (`createSettingsSlice`): owns `outputSettings`; flat action: `updateOutputSettings`.
- **Shared Utilities**: `cleanFlowsOnGroupDelete(flows, groupId, snippetIds)`, `cleanFlowsOnSnippetDelete(flows, snippetId)`, `reindexSnippetOrder(snippets)`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero business logic statements exist in TSX component files after refactor — components contain only JSX, local UI state, and store action calls.
- **SC-002**: All existing features (CRUD, toggle, drag-and-drop reorder, compile output, import/export) work identically after refactor with no regressions.
- **SC-003**: Each store slice file is independently importable and testable without rendering any component.
- **SC-004**: No code duplication exists for cross-slice cleanup logic — shared utilities are used in exactly one place per concern.
- **SC-005**: A developer adding a new action for any model can do so by editing only the relevant slice file and (if needed) a shared utility.
- **SC-006**: No nested sub-objects appear inside any slice creator return value — all state fields and action functions are at the same level of the returned object.

## Assumptions

- "Business logic" means: ID generation, order calculation, cross-entity cleanup, activation rules, validation. Dialog open/close state remains in components as UI-only state.
- The single `useAppStore` hook interface is preserved as a root merge — components don't need to change their import lines.
- Slice files (`useFlows.ts` etc.) are not standalone Zustand stores; they export creator functions that are combined in `useAppStore`.
- `outputSettings` gets its own slice to keep separation clean, even though it is small.
- No test framework is introduced in this refactor (no tests exist yet per CLAUDE.md).
