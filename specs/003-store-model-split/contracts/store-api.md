# Contract: Store Public API

**Feature**: `003-store-model-split` | **Date**: 2026-03-24
**Contract type**: TypeScript interface surface (internal — browser application, no network API)

---

## Consumer: React components

Components import from `@/store/useAppStore` using the Zustand hook pattern. The contract is the TypeScript interface of `useAppStore`.

### Import

```ts
import { useAppStore } from "@/store/useAppStore";
// Optional: direct selector imports for domain-specific use
import { selectGroupActivationState, selectActiveSnippetCount } from "@/store/selectors";
```

### Selector pattern (components)

```ts
// Subscribe to a single field — component only re-renders when that field changes
const flows = useAppStore((s) => s.flows);
const addGroup = useAppStore((s) => s.addGroup);
```

### Full public surface of `useAppStore`

#### State fields

| Field | Type | Persisted | Description |
|-------|------|-----------|-------------|
| `library` | `Library` | ✅ | All groups and their snippets |
| `flows` | `Flow[]` | ✅ | All saved activation states |
| `outputSettings` | `OutputSettings` | ✅ | Compile configuration |
| `activeFlowId` | `string \| null` | ❌ | Currently selected flow |
| `selectedGroupId` | `string \| null` | ❌ | Currently selected group (for snippets panel) |

#### Group actions

| Action | Signature | Persists |
|--------|-----------|----------|
| `addGroup` | `(name: string, description?: string) => void` | ✅ |
| `updateGroup` | `(id: string, patch: Partial<Pick<Group, "name" \| "description">>) => void` | ✅ |
| `deleteGroup` | `(id: string) => void` | ✅ |
| `setSelectedGroup` | `(id: string \| null) => void` | ❌ |

#### Snippet actions

| Action | Signature | Persists |
|--------|-----------|----------|
| `addSnippet` | `(groupId: string, text: string) => void` | ✅ |
| `updateSnippet` | `(id: string, text: string) => void` | ✅ |
| `deleteSnippet` | `(id: string) => void` | ✅ |
| `reorderSnippets` | `(groupId: string, activeId: string, overId: string) => void` | ✅ |

#### Flow actions

| Action | Signature | Persists |
|--------|-----------|----------|
| `addFlow` | `(name: string, icon?: string, description?: string) => void` | ✅ |
| `updateFlow` | `(id: string, patch: Partial<Pick<Flow, "name" \| "icon" \| "description">>) => void` | ✅ |
| `deleteFlow` | `(id: string) => void` | ✅ |
| `duplicateFlow` | `(id: string) => void` | ✅ |
| `setActiveFlow` | `(id: string \| null) => void` | ❌ |

#### Activation actions

| Action | Signature | Persists | Side effects |
|--------|-----------|----------|--------------|
| `toggleGroup` | `(groupId: string) => void` | ✅ | Sets all group's snippets to same active state |
| `toggleSnippet` | `(snippetId: string) => void` | ✅ | Auto-deactivates parent group if last active snippet turns off |

#### Settings actions

| Action | Signature | Persists |
|--------|-----------|----------|
| `updateOutputSettings` | `(patch: Partial<OutputSettings>) => void` | ✅ |

#### Import/Export

| Action | Signature | Persists |
|--------|-----------|----------|
| `importState` | `(state: AppState) => void` | ❌ (caller triggers Dexie write separately) |

---

## Consumer: Selector functions

Pure functions in `@/store/selectors`. No store subscription required — call with values from `useAppStore`.

```ts
// Group activation badge (GroupsListItem)
const state = selectGroupActivationState(group, activeFlow); // "all" | "partial" | "none" | "empty"
const count = selectActiveSnippetCount(group, activeFlow);   // number

// Individual active checks
const groupActive  = selectIsGroupActive(groupId, activeFlow);   // boolean
const snippetActive = selectIsSnippetActive(snippetId, activeFlow); // boolean
```

---

## Invariants (must remain true after any action)

1. `Snippet.order` is always a contiguous 0-based integer sequence within its group.
2. `Flow.activation.snippets[id]` only contains IDs that exist in `library.groups[*].snippets[*].id`.
3. `Flow.activation.groups[id]` only contains IDs that exist in `library.groups[*].id`.
4. If `activeFlowId` is not null, it references a flow that exists in `flows[]`.
5. If `selectedGroupId` is not null, it references a group that exists in `library.groups[]`.
6. `AppState` is always serializable to JSON (no functions, no circular refs, no `undefined` values in persisted fields).
