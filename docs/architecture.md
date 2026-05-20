# Architecture

## Overview

Llamanomicon is a three-layer app: a **data layer** (entity types and relationships), a **store layer** (Zustand slices with a session/baseline model), and a **UI layer** (React components that read from the store and write back through actions). There is no server — everything lives in localStorage.

```txt
┌─────────────────────────────────────────────────────┐
│                     UI Layer                        │
│  AgentList · SkillsList · SnippetsPanel             │
│  OutputWindow · DataControls                        │
├─────────────────────────────────────────────────────┤
│                   Store Layer                       │
│  Zustand slices — session/baseline model            │
│  Selectors compute derived state for components     │
├─────────────────────────────────────────────────────┤
│                   Data Layer                        │
│  Three entity Maps: Snippets, Skills, Agents        │
│  Derived index: snippetsBySkill (rebuilt, not saved)│
│  Persisted to localStorage via Zustand persist      │
└─────────────────────────────────────────────────────┘
```

---

## Data Layer

### Entities

Three independent flat Maps — no nesting, no parent/child ownership.

**Snippet** — the atomic unit of content.

```ts
{ id, name, text: string, skills: Set<string> }
```

`skills` is a set of Skill IDs. A snippet can belong to 0, 1, or many skills. Snippets are **global and shared** — editing one updates it everywhere.

**Skill** — a pure tag with only `{ id, name }`.
Skills exist solely to organize how snippets are browsed. They have no effect on output. "Untagged" is a virtual filter (constant `UNTAGGED_SKILL_ID`), not a stored entity.

**Agent** — a named activation state over the global snippet pool.

```ts
{ id, name, activeSet: Set<string> }
```

- `activeSet` — which snippet IDs are currently active (O(1) membership check).
- Agents reference snippets directly — no relationship to Skills.

### Entity Relationships

```txt
Snippet ←——(many-to-many via snippet.skills)——→ Skill
   ↑
   └——(referenced by ID in activeSet)——→ Agent
```

Skills control the **browse filter** (which snippets are visible in SnippetsPanel).
Agents control **what gets compiled** (which snippets are active and in what order).
These two concerns are independent — a snippet can be visible under a skill filter and inactive in the current agent, or active in the agent but shown under a different skill filter.

### Derived Index

`snippetsBySkill: Map<skillId, Set<snippetId>>` is the inverse of `snippet.skills`. It is **not persisted**. It is rebuilt from live session snippets on load (`onRehydrateStorage`) and updated in-place on every tag mutation or cascade delete.

### Cascade Rules

| Delete  | Cascades to                                                                          |
| ------- | ------------------------------------------------------------------------------------ |
| Snippet | Removed from `agent.activeSet` in all agents; removed from `snippetsBySkill`         |
| Skill   | Removed from `snippet.skills` on all tagged snippets; removed from `snippetsBySkill` |
| Agent   | Self-contained, no cascade                                                           |

---

## Store Layer

### Session / Baseline Model

All user mutations target the live session state. The `baseline` is the last saved snapshot.

```txt
baseline ──(on load)──→ session = structuredClone(baseline)
session  ──(user edits)──→ session only (baseline unchanged)
session  ──(Save)──→ baseline = structuredClone(session) ──→ localStorage
baseline ──(Discard)──→ session = structuredClone(baseline)
```

Components always read from the live session state. `baseline` is what gets written to localStorage.

### Slices

All slices use Immer (`zustand/middleware/immer`) — mutations in `set((s) => { ... })` use direct draft-style assignment.

| File                    | Responsibility                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAppStore.ts`        | Composes all slices; middleware stack `devtools → persist → immer`; `createSelectors()` factory for `.use` accessors                                           |
| `useSnippets.ts`        | Snippet CRUD, `addSkillToSnippet`, `removeSkillFromSnippet`, cascade deletes; exports `selectAllSnippets`, `selectUntaggedSnippets`, `selectSnippetsForSkill`  |
| `useSkills.ts`          | Skill CRUD, `setActiveSkillId`, cascade deletes; exports `selectSortedSkills`, `selectSnippetCountForSkill`, `selectUntaggedSnippetCount`, `UNTAGGED_SKILL_ID` |
| `useAgents.ts`          | Agent CRUD, `setActiveAgentId`; exports `selectActiveAgent`, `selectSortedAgents`, `selectSkillGroupsForOutput` (memoized)                                     |
| `useAgentSnippets.ts`   | `activateSnippet`, `deactivateSnippet`; updates `activeSet`                                                                                                    |
| `useSettings.ts`        | `outputSettings` (`theme`); exports `selectCompiledOutput`, `selectCompiledOutputXML`                                                                          |
| `useDataControls.ts`    | `saveSession`, `discardSession`, `clearData`, `importState`, `rebuildIndex`, `seedData`                                                                        |
| `src/lib/indexUtils.ts` | `addToSetIndex` / `removeFromSetIndex` helpers for `snippetsBySkill`                                                                                           |
| `src/lib/storeUtils.ts` | `UNTAGGED_SKILL_ID`, `sortByName`, `buildSnippetsBySkill` (rebuilds derived index on hydration/reset)                                                          |

---

## UI Layer

### Layout

Two rows, three columns. Output Window spans the full right column. Node Graph is deferred to v2.

| Top-left    | Top-center                    | Right (full height) |
| ----------- | ----------------------------- | ------------------- |
| Agent List  | Node Graph (v2 — placeholder) | Output Window       |
| Skills List | Snippets Panel                | ↑                   |

### Components

| Component      | Reads                                                                                          | Writes                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Agents`       | `selectSortedAgents`, `activeAgentId`                                                          | `addAgent`, `updateAgent`, `deleteAgent`, `setActiveAgentId`                                   |
| `Skills`       | `selectSortedSkills`, `selectSnippetCountForSkill`, `activeSkillId`                            | `addSkill`, `updateSkill`, `deleteSkill`, `setActiveSkillId`                                   |
| `Snippets`     | `selectSnippetsForSkill` / `selectUntaggedSnippets` / `selectAllSnippets`, `selectActiveAgent` | `addSnippet`, `activateSnippet`, `deactivateSnippet`                                           |
| `PromptOutput` | `selectSkillGroupsForOutput`, `selectCompiledOutput`, `selectCompiledOutputXML`                | —                                                                                              |
| `DataControls` | —                                                                                              | `seedData`, `clearData`, `saveSession`, `discardSession`, `exportState`, `importStateFromFile` |

### Output Compilation

`src/lib/compiler.ts` contains pure functions. The active path:

1. `selectSkillGroupsForOutput` (memoized selector in `useAgents.ts`) calls `buildSkillGroups` to produce an ordered `SkillGroup[]` — all skills with active snippets sorted alphabetically, then Untagged last.
2. `selectCompiledOutput` (in `useSettings.ts`) calls `compileOutputBySkillGroup` — iterates groups, emits each snippet's text once (deduplication via `seen` Set), joins with `"\n"`.
3. `selectCompiledOutputXML` (in `useSettings.ts`) calls `compileOutputXML` — same ordering, but wraps each group in `<skillName>` XML tags with bullet-pointed snippets.

`PromptOutput` subscribes to both compiled selectors — output updates reactively with every activation change.

---

## Data Flow: localStorage → Store → UI

```txt
App boot
  └─ Zustand persist reads localStorage key "llamanomicon-v2"
  └─ Custom reviver decodes Map/Set from tagged JSON objects
  └─ onRehydrateStorage: session = structuredClone(baseline)
  └─ rebuildIndex(): builds snippetsBySkill from session snippets
  └─ Components subscribe to useAppStore selectors
  └─ UI renders

User edits (e.g. activates a snippet)
  └─ Component calls store action (activateSnippet)
  └─ Immer draft: agent.activeSet.add(snippetId)
  └─ Zustand notifies subscribers
  └─ OutputWindow re-renders with updated compiled text

User saves
  └─ DataControls calls saveSession()
  └─ baseline = structuredClone({ agents, snippets, skills })
  └─ Zustand persist serializes baseline + outputSettings to localStorage
  └─ (Custom replacer encodes Map/Set as tagged JSON objects)
```
