# Quickstart: Entity Restructure

## What Changed

- **Flows** are now **Agents** — ordered collections of active snippets
- **Groups** are now **Skills** — pure tags (id + name only)
- **Snippets** are independent entities tagged with skills (many-to-many)
- **Library** singleton removed — top-level state is three Maps: `snippets`, `skills`, `agents`
- **Dexie/IndexedDB** replaced with **localStorage** via Zustand `persist` middleware
- **Session model**: all edits apply to a draft; commit persists, discard reverts

## New Store API

```typescript
// Agents
addAgent(name: string): void
deleteAgent(id: string): void
activateSnippet(agentId: string, snippetId: string): void
deactivateSnippet(agentId: string, snippetId: string): void
reorderSnippets(agentId: string, orderedIds: string[]): void
toggleSkillForAgent(agentId: string, skillId: string): void

// Skills
addSkill(name: string): void
deleteSkill(id: string): void  // cascades: removes from all snippets' skills sets

// Snippets
addSnippet(name: string, text: string): void
deleteSnippet(id: string): void  // cascades: removes from all agents + snippetsBySkill
addTag(snippetId: string, skillId: string): void
removeTag(snippetId: string, skillId: string): void

// Session
commit(): void    // baseline = structuredClone(session), persist
discard(): void   // session = structuredClone(baseline), lose edits
```

## Key Selectors

```typescript
selectActiveAgent(state)           // Agent | undefined
selectSelectedSkill(state)         // Skill | undefined
selectSnippetsForSkill(state, id)  // Snippet[]
selectUntaggedSnippets(state)      // Snippet[]
selectCompiledOutput(state)        // string
selectSortedSkills(state)          // Skill[] (alphabetical)
selectSortedAgents(state)          // Agent[] (alphabetical)
```

## Running Tests

```bash
npm test         # vitest run (single pass)
npm run test:watch  # vitest watch mode
```
