# Data Model: UI View-Models & Store Integration

## Core Entities (from UI perspective)

### 1. Snippet
The atomic unit of content. In the UI, it is typically accessed via the `draft.snippets` Map.
- **Fields**: `id` (UUID), `name`, `text`, `skills` (Set of Skill IDs).
- **UI Logic**: 
  - Rendered in `SnippetsPanel`.
  - Filtered by `selectedSkillId` (if set) using the `skills` Set.
  - Active state determined by `draft.agents[activeAgentId].activeSet.has(snippet.id)`.

### 2. Skill
A tagging mechanism for snippets. Accessed via `draft.skills`.
- **Fields**: `id` (UUID), `name`.
- **UI Logic**:
  - Rendered in `SkillsList` as selectable filters.
  - Ordered alphabetically by `name`.

### 3. Agent
An ordered collection of snippets. Accessed via `draft.agents`.
- **Fields**: `id` (UUID), `name`, `activeSet` (Set of Snippet IDs), `activeOrder` (Array of Snippet IDs).
- **UI Logic**:
  - Rendered in `AgentList` (formerly `FlowList`).
  - `activeOrder` determines the sequence of snippets in the `OutputWindow`.
  - `activeSet` provides O(1) lookup for snippet activation status.

## Derived State & Indices

### 1. snippetsBySkill
- **Type**: `Map<string, Set<string>>` (Skill ID -> Set of Snippet IDs).
- **UI Purpose**: Enables O(1) filtering in `SnippetsPanel` when a skill is selected.

### 2. Untagged Filter
- **UI Purpose**: Virtual filter for snippets where `snippet.skills.size === 0`.

## Relationships
- **Snippet ↔ Skill**: Many-to-Many (via `snippet.skills` Set and `snippetsBySkill` Map).
- **Agent ↔ Snippet**: One-to-Many ordered activation (via `agent.activeOrder` and `agent.activeSet`).
- **Agent ↔ Skill**: No direct relationship. Skills are purely for snippet management/filtering.
