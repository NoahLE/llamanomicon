# Data Model: Store Model Split

**Feature**: `003-store-model-split` | **Date**: 2026-03-24

## Overview

This document captures the type system and store architecture introduced by the store model split refactor. No domain entity shapes change (Snippet, Group, Flow remain identical). The changes are entirely in how state is owned, typed, and accessed.

---

## Domain Entities (unchanged)

These types live in `src/types/index.ts` and are unmodified by this refactor.

### Snippet

```ts
interface Snippet {
  id: string;          // crypto.randomUUID()
  text: string;        // snippet body text
  order: number;       // 0-based index within parent group
  groupId: string;     // FK → Group.id
}
```

### Group

```ts
interface Group {
  id: string;           // crypto.randomUUID()
  name: string;
  description?: string;
  snippets: Snippet[];  // ordered by Snippet.order
}
```

### Library

```ts
interface Library {
  groups: Group[];      // ordered by insertion
}
```

### Flow

```ts
interface Flow {
  id: string;           // crypto.randomUUID()
  name: string;
  icon: string;         // emoji string
  description?: string;
  activation: FlowActivation;
}

interface FlowActivation {
  groups: Record<string, boolean>;    // groupId → active
  snippets: Record<string, boolean>;  // snippetId → active
}
```

### OutputSettings

```ts
interface OutputSettings {
  showGroupHeaders: boolean;
  snippetSeparator: string;  // default "\n"
}
```

### AppState

Persisted snapshot (written to Dexie as `{ id: 1, state: AppState }`).

```ts
interface AppState {
  library: Library;
  flows: Flow[];
  outputSettings: OutputSettings;
}
```

---

## Store Architecture (new)

### StoreData

Added to `src/types/index.ts`. Provides a concrete, non-circular type for `set`/`get` parameters inside slice creator functions.

```ts
interface StoreData extends AppState {
  activeFlowId: string | null;   // UI state — not persisted
  selectedGroupId: string | null; // UI state — not persisted
}
```

**Why not `StoreState`?** `StoreState` includes action functions. Slice files would need to import it from `useAppStore.ts`, creating a runtime circular dependency. `StoreData` contains only data fields (no functions), lives in `types/index.ts`, and is safely imported by all slice files without circular risk.

### Slice Interfaces

Each slice file exports a TypeScript interface representing its contribution to the root store.

#### GroupsSlice (`src/store/useGroups.ts`)

```ts
interface GroupsSlice {
  // State
  library: Library;
  selectedGroupId: string | null;
  // Actions (flat — no nested sub-objects)
  addGroup: (name: string, description?: string) => void;
  updateGroup: (id: string, patch: Partial<Pick<Group, "name" | "description">>) => void;
  deleteGroup: (id: string) => void;
  setSelectedGroup: (id: string | null) => void;
}
```

#### SnippetsSlice (`src/store/useSnippets.ts`)

```ts
interface SnippetsSlice {
  // No owned state (snippets nested inside library.groups[].snippets)
  addSnippet: (groupId: string, text: string) => void;
  updateSnippet: (id: string, text: string) => void;
  deleteSnippet: (id: string) => void;
  reorderSnippets: (groupId: string, activeId: string, overId: string) => void;
}
```

#### FlowsSlice (`src/store/useFlows.ts`)

```ts
interface FlowsSlice {
  // State
  flows: Flow[];
  activeFlowId: string | null;
  // Actions (flat)
  addFlow: (name: string, icon?: string, description?: string) => void;
  updateFlow: (id: string, patch: Partial<Pick<Flow, "name" | "icon" | "description">>) => void;
  deleteFlow: (id: string) => void;
  duplicateFlow: (id: string) => void;
  setActiveFlow: (id: string | null) => void;
  toggleGroup: (groupId: string) => void;
  toggleSnippet: (snippetId: string) => void;
}
```

**Note**: `toggleGroup` and `toggleSnippet` operate on the `activeFlowId` flow. `toggleSnippet` contains the auto-deactivate-group rule (FR-008): when the last active snippet in a group is turned off, the group itself is marked inactive.

#### SettingsSlice (`src/store/useSettings.ts`)

```ts
interface SettingsSlice {
  outputSettings: OutputSettings;
  updateOutputSettings: (patch: Partial<OutputSettings>) => void;
}
```

### Root Store Type

Defined in `src/store/useAppStore.ts`:

```ts
type StoreState = GroupsSlice & SnippetsSlice & FlowsSlice & SettingsSlice & {
  importState: (state: AppState) => void;
};
```

`importState` replaces all persisted state atomically (library, flows, outputSettings) and resets UI state (activeFlowId, selectedGroupId) to null. It does NOT call `persist()` to avoid double-write on boot hydration.

---

## Persistence Model

- **Written by**: `persist()` closure inside `useAppStore`'s `create()` call.
- **Triggered by**: Every mutating action (add/update/delete/toggle/reorder/updateOutputSettings). Not triggered by `importState` or `setActiveFlow`/`setSelectedGroup`.
- **Format**: `{ id: 1, state: AppState }` — Dexie `put()` (upsert).
- **Read by**: `loadState()` in `App.tsx` `useEffect`, passed to `importState()`.

---

## Selector Functions (`src/store/selectors.ts`)

Pure functions — no store import, no side effects. Accept state slices as arguments.

```ts
// "all" | "partial" | "none" | "empty"
type GroupActivationState = "all" | "partial" | "none" | "empty";

selectGroupActivationState(group: Group, activeFlow: Flow | null | undefined): GroupActivationState
selectActiveSnippetCount(group: Group, activeFlow: Flow | null | undefined): number
selectIsGroupActive(groupId: string, activeFlow: Flow | null | undefined): boolean
selectIsSnippetActive(snippetId: string, activeFlow: Flow | null | undefined): boolean
```

**Usage**: Components import selectors and call them with values from `useAppStore`. No derived logic remains in JSX.

---

## Shared Utilities (`src/store/utils/storeUtils.ts`)

Pure functions — no store import. Return new arrays without mutation.

```ts
cleanFlowsOnGroupDelete(flows: Flow[], groupId: string, snippetIds: string[]): Flow[]
cleanFlowsOnSnippetDelete(flows: Flow[], snippetId: string): Flow[]
reindexSnippetOrder(snippets: Snippet[]): Snippet[]
```

**Call sites**:
- `cleanFlowsOnGroupDelete` — called by `createGroupsSlice.deleteGroup`
- `cleanFlowsOnSnippetDelete` — called by `createSnippetsSlice.deleteSnippet`
- `reindexSnippetOrder` — called by `createSnippetsSlice.deleteSnippet` and `createSnippetsSlice.reorderSnippets`

Each utility has ≥2 call sites or is the single canonical implementation of a cross-slice concern (satisfying Constitution V — rule of three / DRY).

---

## State Transitions

### Snippet lifecycle

```
addSnippet(groupId, text)
  → library.groups[groupId].snippets.push({ id: uuid, text, order: length, groupId })
  → persist()

updateSnippet(id, text)
  → library.groups[*].snippets[id].text = trimmed
  → persist()

deleteSnippet(id)
  → library.groups[*].snippets = reindexSnippetOrder(snippets.filter(id))
  → flows = cleanFlowsOnSnippetDelete(flows, id)
  → persist()

reorderSnippets(groupId, activeId, overId)
  → library.groups[groupId].snippets reordered + reindexed
  → persist()
```

### Group lifecycle

```
addGroup(name, description?)
  → library.groups.push({ id: uuid, name, description, snippets: [] })
  → persist()

updateGroup(id, patch)
  → library.groups[id] = { ...group, ...patch }
  → persist()

deleteGroup(id)
  → library.groups = library.groups.filter(id)
  → flows = cleanFlowsOnGroupDelete(flows, id, snippetIds)
  → selectedGroupId = null if was selected
  → persist()
```

### Activation lifecycle

```
toggleGroup(groupId)
  → flows[activeFlowId].activation.groups[groupId] = !current
  → flows[activeFlowId].activation.snippets[*] = newGroupActive  (all snippets in group)
  → persist()

toggleSnippet(snippetId)
  → flows[activeFlowId].activation.snippets[snippetId] = !current
  → IF turning off AND no other snippet in ownerGroup is active:
      flows[activeFlowId].activation.groups[ownerGroup.id] = false
  → persist()
```
