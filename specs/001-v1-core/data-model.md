# Data Model: Llamanomicon V1 Core

**Branch**: `001-v1-core` | **Date**: 2026-03-07

## Entity Overview

```
AppState (root — serialized for import/export)
├── library: Library
│   └── groups: Group[]
│         └── snippets: Snippet[]  (ordered by `order` field)
├── flows: Flow[]
│     └── activation: FlowActivation
└── outputSettings: OutputSettings

UI State (Zustand only — not persisted in export)
└── selectedGroupId: string | null
└── activeFlowId: string | null
```

---

## Core Entities

### Snippet

The smallest unit of content. Belongs to exactly one Group.

```ts
interface Snippet {
  id: string; // UUIDv4 — stable across renames
  text: string; // Raw prompt text; no formatting enforced
  order: number; // Integer; determines output order within group
  groupId: string; // FK to parent Group.id
}
```

**Rules**:

- `order` MUST be unique within a group (0-based, contiguous after reorder)
- `text` MUST be non-empty (trimmed) before saving
- `id` is immutable after creation; re-generating on edit is forbidden (breaks activation maps)
- Deleting a snippet MUST remove its `id` from all `FlowActivation.snippets` maps

### Group

A named collection of Snippets. Global — not owned by any Flow.

```ts
interface Group {
  id: string; // UUIDv4
  name: string; // Display name; MUST be non-empty (trimmed)
  description?: string; // Optional; shown as subtitle in Groups panel
  snippets: Snippet[]; // Ordered by Snippet.order ascending
}
```

**Rules**:

- Group names need not be unique (no uniqueness constraint)
- Deleting a Group MUST delete all its Snippets and remove `groupId` from all FlowActivation maps
- Group order in the Library is the output order — no per-flow group reordering in V1

### Library

Singleton container. There is exactly one Library per app instance.

```ts
interface Library {
  groups: Group[]; // Order determines output order
}
```

**Rules**:

- Groups MUST NOT be reordered per-flow in V1 (deferred to v2)
- The Library is the single source of truth for all snippet content

### FlowActivation

Records which Groups and Snippets are active for a given Flow. Does not duplicate content.

```ts
interface FlowActivation {
  groups: Record<string, boolean>; // groupId → active
  snippets: Record<string, boolean>; // snippetId → active
}
```

**Rules**:

- Absence of a key is equivalent to `false` (falsy default)
- When a new Snippet/Group is created, it is NOT added to existing flows — each flow's
  activation is only modified by explicit user toggle
- Group-level toggle is a convenience — toggling a group off suppresses its snippets in
  the output regardless of individual snippet state
- Snippet-level toggle is independent of group toggle for storage; output compilation
  respects group toggle as the outer gate

### Flow

A saved activation state over the global Library.

```ts
interface Flow {
  id: string; // UUIDv4
  name: string; // Display name; MUST be non-empty (trimmed)
  icon: string; // Emoji character (e.g., "💻"); defaults to "📋"
  description?: string; // Optional; shown as subtitle in Flow list
  activation: FlowActivation;
}
```

**Rules**:

- Duplicating a Flow creates a new Flow with a deep copy of `activation` and appended
  name (e.g., "Senior Dev Review (copy)")
- Deleting a Flow does not affect the Library or other Flows
- A new Flow starts with empty `activation` (all groups/snippets inactive)

### OutputSettings

Global display configuration for the compiled output.

```ts
interface OutputSettings {
  showGroupHeaders: boolean; // Prepend "### {group.name}" before each group block
  snippetSeparator: string; // Inserted between active snippets; default: "\n"
}
```

**Default**:

```ts
const DEFAULT_OUTPUT_SETTINGS: OutputSettings = {
  showGroupHeaders: true,
  snippetSeparator: "\n",
};
```

---

## Root AppState (Persisted)

```ts
interface AppState {
  library: Library;
  flows: Flow[];
  outputSettings: OutputSettings;
}
```

This is the exact shape serialized to IndexedDB and exported as JSON.

---

## Zustand Store Shape

```ts
interface StoreState extends AppState {
  // UI state (not in AppState export)
  activeFlowId: string | null;
  selectedGroupId: string | null;

  // Library actions
  addGroup: (name: string, description?: string) => void;
  updateGroup: (
    id: string,
    patch: Partial<Pick<Group, "name" | "description">>,
  ) => void;
  deleteGroup: (id: string) => void;
  addSnippet: (groupId: string, text: string) => void;
  updateSnippet: (id: string, text: string) => void;
  deleteSnippet: (id: string) => void;
  reorderSnippets: (groupId: string, activeId: string, overId: string) => void;

  // Flow actions
  addFlow: (name: string, icon?: string, description?: string) => void;
  updateFlow: (
    id: string,
    patch: Partial<Pick<Flow, "name" | "icon" | "description">>,
  ) => void;
  deleteFlow: (id: string) => void;
  duplicateFlow: (id: string) => void;
  setActiveFlow: (id: string | null) => void;

  // Activation actions (operate on the active flow)
  toggleGroup: (groupId: string) => void;
  toggleSnippet: (snippetId: string) => void;

  // UI actions
  setSelectedGroup: (id: string | null) => void;

  // Settings actions
  updateOutputSettings: (patch: Partial<OutputSettings>) => void;

  // Import action (replaces entire state)
  importState: (state: AppState) => void;
}
```

---

## Dexie Schema

Single-table design: the entire `AppState` is stored as one JSON record.

```ts
class LlamanomiconDB extends Dexie {
  appState!: EntityTable<{ id: 1; state: AppState }, "id">;

  constructor() {
    super("llamanomicon");
    this.version(1).stores({ appState: "id" });
  }
}
```

Key `id` is always `1` — one row, full state snapshot. This avoids relational complexity
and matches the replace-not-merge import behavior.

**Migration path**: If schema evolves in v2, Dexie's `version(2).upgrade()` API handles
migration. All migration logic lives in `database.ts`.

---

## ID Generation

Use `crypto.randomUUID()` (native browser API, available in all target browsers, no import
needed). Do not use `Date.now()` or sequential integers — they are not collision-safe.

---

## Validation Rules Summary

| Field                             | Rule                                           |
| --------------------------------- | ---------------------------------------------- |
| `Snippet.text`                    | Non-empty after trim; max length: 10,000 chars |
| `Snippet.order`                   | Integer ≥ 0; unique within group               |
| `Group.name`                      | Non-empty after trim; max length: 100 chars    |
| `Flow.name`                       | Non-empty after trim; max length: 100 chars    |
| `Flow.icon`                       | Single emoji character; default "📋" if empty  |
| `OutputSettings.snippetSeparator` | String; may be empty; no max length            |

Validation is enforced in Zustand action functions before state mutation. Invalid input
is rejected silently in V1 (no toast for empty-string submissions — the UI prevents it
via disabled submit state).
