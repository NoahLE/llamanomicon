# Data Model: Component Store Migration & Testing

**Branch**: `001-migrate-components` | **Date**: 2026-04-20  
**Source of truth**: `src/store/` slices + `docs/models.md`

This document maps the store's data model to component responsibilities. No new entities are introduced by this feature — all data structures are pre-existing.

---

## Core Entities

### Agent
```
id: string (UUID)
name: string
activeSet: Set<string>       // O(1) membership check for snippet IDs
activeOrder: string[]        // User-defined display/output order of active snippets
```
- **Owned by**: `useAgents.ts` slice
- **Consumed by**: AgentList (CRUD), SnippetsPanel (read activeSet/activeOrder), OutputWindow (read activeOrder)
- **Invariant**: `activeSet` and `activeOrder` must always be in sync

### Snippet
```
id: string (UUID)
name: string
text: string
skills: Set<string>          // skill IDs
```
- **Owned by**: `useSnippets.ts` slice
- **Consumed by**: SnippetsPanel (render, toggle active, reorder), OutputWindow (read text via compiled output)
- **Shared**: Single source of truth across all agents; editing a snippet updates everywhere

### Skill
```
id: string (UUID)
name: string
```
- **Owned by**: `useSkills.ts` slice
- **Consumed by**: SkillsList (CRUD, set active), SnippetsPanel (filter via `activeSkillId`)
- **Virtual**: "Untagged" is not a stored entity — it is a UI filter meaning `snippet.skills.size === 0`

### OutputSettings
```
snippetSeparator: string     // default: "\n\n"
```
- **Owned by**: `useSettings.ts` slice
- **Consumed by**: OutputWindow (read separator for compiled output)

---

## Derived State

### snippetsBySkill
```
Map<skillId: string, Set<snippetId: string>>
```
- Built on load, updated on tag mutations, never persisted
- Used by `selectSnippetsForSkill` selector
- **Not consumed directly by components** — accessed via selectors only

### Compiled Output
```
selectCompiledOutput(state): string
```
- Pure derivation: `agent.activeOrder → snippet texts → join(separator) → trim`
- Returns `""` when no active agent or no active snippets
- **Consumed by**: OutputWindow exclusively

---

## Store Access Pattern (for components)

All components must follow this pattern:

```typescript
// Reading state — use selector + useShallow for collections
const skills = useAppStore(selectSortedSkills, useShallow)
const agent = useAppStore(selectActiveAgent)

// Reading primitive/scalar — use .use accessor
const activeSkillId = useAppStore.use.activeSkillId()

// Dispatching actions — use .use accessor
const addSkill = useAppStore.use.addSkill()
```

---

## Session Model

Components do **not** interact with the session model directly. Mutations apply to `draft`; `commit()` and `discard()` are managed by the DataControls component. No component should call `commit()` or `discard()` except DataControls.

```
draft (ephemeral) ─── mutations apply here
baseline (persisted) ─ commit() copies draft→baseline
                        discard() copies baseline→draft
```

---

## State Transitions Relevant to Components

| Action | Triggered by | Effect |
|--------|-------------|--------|
| `setActiveAgentId(id)` | AgentList | Changes which agent's snippets appear in SnippetsPanel and OutputWindow |
| `setActiveSkillId(id)` | SkillsList | Filters snippets shown in SnippetsPanel |
| `activateSnippet(agentId, snippetId)` | SnippetsPanel | Adds to agent activeSet + activeOrder |
| `deactivateSnippet(agentId, snippetId)` | SnippetsPanel | Removes from agent activeSet + activeOrder |
| `reorderSnippets(agentId, orderedIds)` | SnippetsPanel (DnD) | Replaces agent activeOrder |
| `toggleSkillForAgent(agentId, skillId)` | SnippetsPanel | Bulk activate/deactivate snippets by skill |
