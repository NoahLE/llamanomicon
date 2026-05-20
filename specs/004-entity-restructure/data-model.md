# Data Model: Entity Restructure

## Entities

### Entity (base)

```typescript
interface Entity {
  id: string;   // crypto.randomUUID()
  name: string; // trimmed, non-empty
}
```

### Snippet

Atomic text content tagged with skills. Independent entity — not a child of any group.

```typescript
interface Snippet extends Entity {
  text: string;         // the prompt text
  skills: Set<string>;  // skill IDs this snippet is tagged with
}
```

- Many-to-many relationship with Skills
- Shared across Agents — editing text updates everywhere
- No `order` or `groupId` field

### Skill

Pure tag. No stored order, no children.

```typescript
interface Skill extends Entity {}
// Just id + name. Nothing else.
```

- Many-to-many relationship with Snippets
- Displayed alphabetically by name
- "Untagged" is a virtual filter (`snippet.skills.size === 0`), not a real Skill

### Agent

Ordered collection of active snippets. Produces output.

```typescript
interface Agent extends Entity {
  activeSet: Set<string>;    // snippet IDs — O(1) membership check
  activeOrder: string[];     // snippet IDs — user-defined output order
}
```

- `activeSet` and `activeOrder` MUST always be in sync
- No relationship to Skills — references Snippets directly
- Self-contained on delete (no cascade needed)

## Composite Types

### DataState

The core data — three entity maps.

```typescript
interface DataState {
  snippets: Map<string, Snippet>;
  skills: Map<string, Skill>;
  agents: Map<string, Agent>;
}
```

### SessionState

Draft/baseline session model.

```typescript
interface SessionState {
  baseline: DataState;  // persisted
  draft: DataState;     // not persisted, rebuilt from baseline on hydration
}
```

### OutputSettings

```typescript
interface OutputSettings {
  snippetSeparator: string; // default: "\n"
}
```

`showGroupHeaders` removed — skills are tags, not output sections.

### AppState (serialized form)

Used for import/export JSON. Plain objects and arrays instead of Map/Set.

```typescript
interface AppState {
  snippets: Record<string, SerializedSnippet>;
  skills: Record<string, SerializedSkill>;
  agents: Record<string, SerializedAgent>;
  outputSettings: OutputSettings;
}
```

## Derived Index

### snippetsBySkill

```typescript
Map<string, Set<string>>  // skillId → Set<snippetId>
```

- Rebuilt on load from `draft.snippets`
- Updated after any `addTag` / `removeTag` / snippet delete / skill delete
- NOT persisted
- Enables O(1) lookup: "give me all snippets tagged with skill X"

## Relationships

```
Snippet ←→ Skill    : many-to-many (via snippet.skills + snippetsBySkill index)
Agent   → Snippet   : many-to-many with order (via activeSet + activeOrder)
Agent   ↛ Skill     : no relationship
```

## Cascade Rules

| Delete    | Cascade                                                                    |
| --------- | -------------------------------------------------------------------------- |
| Snippet   | Remove from `snippetsBySkill` for each tag. Remove from every agent's `activeSet` and `activeOrder`. |
| Skill     | Remove from each tagged snippet's `skills` set. Remove from `snippetsBySkill`. |
| Agent     | Self-contained. No cascade.                                                |

No dangling IDs permitted after any delete.

## Sorting (presentation, not storage)

| Entity                    | Order             |
| ------------------------- | ----------------- |
| Skills list               | Alphabetical by name |
| Snippets within skill     | Alphabetical by name |
| Agents list               | Alphabetical by name |
| Agent output              | `activeOrder` (user-defined) |

## Session Semantics

- All mutations apply to `draft`, never `baseline`
- `commit()`: `baseline = structuredClone(draft)` → persist baseline
- `discard()`: `draft = structuredClone(baseline)` → lose uncommitted edits
- On hydration: `draft = structuredClone(baseline)` (discard-by-default)
