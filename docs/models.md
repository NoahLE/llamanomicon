# Models

All types are defined in `src/types/`. IDs are generated with `crypto.randomUUID()`.

---

## Entity (base)

All entities share a common base interface.

```ts
interface Entity {
  id: string;
  name: string;
}
```

| Field  | Type     | Description                       |
| ------ | -------- | --------------------------------- |
| `id`   | `string` | UUID, generated at creation       |
| `name` | `string` | Display name (trimmed, non-empty) |

---

## Snippet

Atomic text content tagged with skills. Independent entity — not a child of any group. Shared across all agents — editing a snippet updates everywhere it appears.

```ts
interface Snippet extends Entity {
  text: string;
  skills: Set<string>;
}
```

| Field    | Type          | Description                                  |
| -------- | ------------- | -------------------------------------------- |
| `id`     | `string`      | UUID, generated at creation                  |
| `name`   | `string`      | Display name                                 |
| `text`   | `string`      | The prompt text                              |
| `skills` | `Set<string>` | Set of skill IDs this snippet is tagged with |

- Many-to-many relationship with Skills (via `skills` set + `snippetsBySkill` index)
- No `order` or `groupId` field — snippets are independent entities
- Displayed alphabetically by name within skill views

---

## Skill

Pure tag. No stored order, no children, no extra fields.

```ts
interface Skill extends Entity {}
```

| Field  | Type     | Description                 |
| ------ | -------- | --------------------------- |
| `id`   | `string` | UUID, generated at creation |
| `name` | `string` | Display name                |

- Many-to-many relationship with Snippets
- Displayed alphabetically by name
- "Untagged" is a virtual filter (`snippet.skills.size === 0`), not a stored Skill

---

## Agent

Ordered collection of active snippets. Produces the compiled output.

```ts
interface Agent extends Entity {
  activeSet: Set<string>;
}
```

| Field       | Type          | Default | Description                         |
| ----------- | ------------- | ------- | ----------------------------------- |
| `id`        | `string`      | —       | UUID, generated at creation         |
| `name`      | `string`      | —       | Display name                        |
| `activeSet` | `Set<string>` | —       | Snippet IDs — O(1) membership check |

- References snippets directly by ID — no relationship to skills
- Displayed alphabetically by name in the agent list
- Output order: skill groups sorted alphabetically; Untagged always last

---

## DataState

The core data — three entity maps.

```ts
interface DataState {
  snippets: Map<string, Snippet>;
  skills: Map<string, Skill>;
  agents: Map<string, Agent>;
}
```

---

## SessionState

Session/baseline model.

```ts
interface SessionState {
  baseline: DataState;
  session: DataState;
}
```

- All mutations apply to `session` (the live working state), never `baseline`
- `saveSession()`: `baseline = structuredClone(session)` → persist baseline
- `discardSession()`: `session = structuredClone(baseline)` → lose uncommitted edits
- On hydration: `session = structuredClone(baseline)` (discard-by-default on refresh)

---

## OutputSettings

Controls app-level display settings.

```ts
interface OutputSettings {
  theme: Theme;
}
```

| Field   | Type    | Description                                             |
| ------- | ------- | ------------------------------------------------------- |
| `theme` | `Theme` | HeroUI theme (`"light"` or `"dark"`); default `"light"` |

`Theme` is the HeroUI theme type imported from `@heroui/react`.

---

## AppState (serialized form)

Used for import/export JSON and persistence. Plain objects and arrays instead of Map/Set.

```ts
interface AppState {
  snippets: Record<string, SerializedSnippet>;
  skills: Record<string, SerializedSkill>;
  agents: Record<string, SerializedAgent>;
  outputSettings: OutputSettings;
}
```

---

## Derived Index: snippetsBySkill

```ts
Map<string, Set<string>>; // skillId → Set<snippetId>
```

- Rebuilt on load from `draft.snippets`
- Updated after any `addTag` / `removeTag` / snippet delete / skill delete
- NOT persisted
- Enables O(1) lookup: "give me all snippets tagged with skill X"

---

## Relationships

```txt
Snippet ←→ Skill    : many-to-many (via snippet.skills + snippetsBySkill index)
Agent   → Snippet   : many-to-many (via activeSet)
Agent   ↛ Skill     : no relationship
```

## Cascade Rules

| Delete  | Cascade                                                                            |
| ------- | ---------------------------------------------------------------------------------- |
| Snippet | Remove from `snippetsBySkill` for each tag. Remove from every agent's `activeSet`. |
| Skill   | Remove from each tagged snippet's `skills` set. Remove from `snippetsBySkill`.     |
| Agent   | Self-contained. No cascade.                                                        |

No dangling IDs permitted after any delete.

## Sorting (presentation, not storage)

| Entity                      | Order                              |
| --------------------------- | ---------------------------------- |
| Skills list                 | Alphabetical by name               |
| Snippets within skill       | Alphabetical by name               |
| Agents list                 | Alphabetical by name               |
| Skill groups in output      | Alphabetical; Untagged always last |
| Snippets within skill group | Alphabetical by name               |
