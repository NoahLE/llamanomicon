# Feature Specification: Entity Restructure — Flows to Agents, Groups to Skills, New Data Model

**Feature Branch**: `004-entity-restructure`
**Created**: 2026-04-19
**Status**: Draft
**Input**: User description: "The structure of the project has changed. Flows are renamed to agents, groups are renamed to skills, and the way these entities are related has changed as outlined in update.md. Changes should be updated first in docs, then the Zustand store, then the UI. Focus on one entity type at a time (agent, skill, snippet)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Snippet Management with Skill Tags (Priority: P1)

A user creates, edits, renames, and deletes snippets. Snippets are text fragments that can be tagged with one or more skills. Snippets are global — they are shared across all agents. Editing a snippet's text updates everywhere it appears.

**Why this priority**: Snippets are the atomic content unit. Nothing else works without them.

**Independent Test**: Create a snippet, tag it with a skill, verify it appears when filtering by that skill. Edit the snippet text and confirm the change is reflected in any agent that includes it.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user creates a snippet with name and text, **Then** it appears in the snippet list with a unique UUID.
2. **Given** a snippet exists, **When** the user adds a skill tag to it, **Then** that snippet appears under the skill's filtered view and the inverse index (`snippetsBySkill`) is updated.
3. **Given** a snippet is tagged with skills, **When** the user removes a skill tag, **Then** both the snippet's `skills` set and the `snippetsBySkill` inverse index are updated.
4. **Given** a snippet is active in one or more agents, **When** the user deletes the snippet, **Then** it is removed from every agent's `activeSet` and `activeOrder`, and from `snippetsBySkill` for each of its tags. No dangling IDs remain.

---

### User Story 2 — Skill Management as Tags (Priority: P1)

A user creates, renames, and deletes skills. Skills are pure tags — they have only an id and a name. They impose no stored order on snippets; snippets under a skill are displayed alphabetically. An "Untagged" virtual filter shows snippets with no skills.

**Why this priority**: Skills organize snippets. Co-equal with snippets for a functional app.

**Independent Test**: Create a skill, tag snippets with it, filter by it to see only relevant snippets. Delete the skill and confirm it is removed from all tagged snippets.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user creates a skill with a name, **Then** it appears in the skill list alphabetically sorted.
2. **Given** snippets exist with and without skill tags, **When** the user selects the "Untagged" filter, **Then** only snippets with an empty `skills` set are shown.
3. **Given** a skill is tagged on several snippets, **When** the user deletes the skill, **Then** the skill ID is removed from each snippet's `skills` set and the skill's entry is removed from `snippetsBySkill`. No dangling IDs.
4. **Given** a skill exists, **When** the user renames it, **Then** the name updates everywhere it's displayed.

---

### User Story 3 — Agent Management with Ordered Active Snippets (Priority: P1)

A user creates, renames, and deletes agents. An agent is an ordered collection of active snippets. The user activates/deactivates snippets within an agent and reorders them. The compiled output is the text of the agent's active snippets joined in the user-defined order.

**Why this priority**: Agents are what produce the final output — the core use case.

**Independent Test**: Create an agent, activate several snippets, reorder them, and verify the output window shows the snippets' text in the specified order.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user creates an agent with a name, **Then** it appears in the agent list with empty `activeSet` and `activeOrder`.
2. **Given** an agent exists and snippets exist, **When** the user activates a snippet for the agent, **Then** the snippet id is added to both `activeSet` and appended to `activeOrder`.
3. **Given** an agent has active snippets, **When** the user reorders snippets, **Then** `activeOrder` updates and the output reflects the new order.
4. **Given** an agent has active snippets, **When** the user deactivates a snippet, **Then** it is removed from both `activeSet` and `activeOrder`.
5. **Given** an agent exists, **When** the user deletes it, **Then** it is removed. No cascade to snippets or skills needed (agents are self-contained).

---

### User Story 4 — Bulk Toggle via Skill (Priority: P2)

A user can toggle all snippets tagged with a particular skill on or off within an agent. This is a convenience operation for activating/deactivating groups of related snippets at once.

**Why this priority**: Important UX shortcut but not needed for core loop.

**Independent Test**: Create an agent, tag several snippets with a skill, use the skill toggle to activate them all, verify they appear in the output. Toggle off and verify they're removed.

**Acceptance Scenarios**:

1. **Given** an agent is active and a skill has tagged snippets, **When** the user toggles the skill on for the agent, **Then** all snippets with that skill are added to `activeSet` and `activeOrder`.
2. **Given** an agent has snippets activated via skill toggle, **When** the user toggles the skill off, **Then** those snippets are removed from `activeSet` and `activeOrder`.

---

### User Story 5 — Session Commit/Discard (Priority: P2)

All edits happen on a live session copy of the data. The user can commit (replace baseline with session) or discard (replace session with baseline) at any time.

**Why this priority**: Safety net for bulk edits. Needed before users trust doing large changes.

**Independent Test**: Make several edits, discard them, verify state reverts. Make edits, commit, verify state persists after reload.

**Acceptance Scenarios**:

1. **Given** the app has loaded, **When** the user makes edits, **Then** edits are applied to the session, not the persisted baseline.
2. **Given** edits exist in the session, **When** the user commits, **Then** the baseline is replaced with the session and persisted.
3. **Given** edits exist in the session, **When** the user discards, **Then** the session is replaced with the baseline and uncommitted edits are lost.

---

### Edge Cases

- What happens when a snippet is deleted that is active in multiple agents? — Cascades to all agents' `activeSet` and `activeOrder`.
- What happens when the last snippet tagged with a skill is deleted? — The skill remains (it's just a tag with no snippets). `snippetsBySkill` entry becomes an empty set.
- What happens when a skill is deleted that was used for bulk-toggling in agents? — Only the tag is removed from snippets. Agent `activeSet`/`activeOrder` are not affected (agents reference snippets directly, not via skills).
- What happens if the user activates a snippet that's already active in an agent? — No-op. `activeSet` is a Set, so `add` on existing member is idempotent.
- How does "Untagged" behave? — It is a virtual filter (`snippet.skills.size === 0`), not a stored skill. It cannot be deleted or renamed.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST rename all "Flow" entities, types, and references to "Agent" throughout docs, store, types, and UI.
- **FR-002**: System MUST rename all "Group" entities, types, and references to "Skill" throughout docs, store, types, and UI.
- **FR-003**: Snippet MUST have fields: `id` (UUID string), `name` (string), `text` (string), `skills` (Set of skill IDs).
- **FR-004**: Snippet MUST NOT have an `order` field or a `groupId` field. Snippets are independent entities, not children of a group/skill.
- **FR-005**: Skill MUST have fields: `id` (UUID string), `name` (string). No other fields. Pure tag.
- **FR-006**: Agent MUST have fields: `id` (UUID string), `name` (string), `activeSet` (Set of snippet IDs), `activeOrder` (Array of snippet IDs).
- **FR-007**: System MUST maintain a derived `snippetsBySkill` index (Map from skill ID to Set of snippet IDs). This index is rebuilt on load and updated on tag mutations. It is NOT persisted.
- **FR-008**: Primary storage MUST use `Map<id, Entity>` for each entity table, not arrays.
- **FR-009**: Agent's `activeSet` and `activeOrder` MUST always be in sync — every ID in `activeOrder` MUST be in `activeSet` and vice versa.
- **FR-010**: System MUST support `activate`, `deactivate`, `reorder` (snippet within agent), `addTag`, `removeTag` (snippet ↔ skill), `toggleSkillForAgent` (bulk activate/deactivate), and standard CRUD + rename for each entity.
- **FR-011**: Delete cascade rules MUST be: delete snippet removes from `snippetsBySkill` for each tag and from every agent's `activeSet`/`activeOrder`; delete skill removes from each tagged snippet's `skills` set and from `snippetsBySkill`; delete agent is self-contained with no cascade.
- **FR-012**: Skills MUST be displayed alphabetically by name. Snippets within a skill view MUST be displayed alphabetically by name. Agents MUST be displayed alphabetically by name in the agent list. Agent output MUST follow `activeOrder`.
- **FR-013**: System MUST support a session model with live session state and persisted baseline, with commit and discard operations using `structuredClone`.
- **FR-014**: The Library concept (singleton root holding groups array) MUST be removed. Top-level state is three Maps: `snippets`, `skills`, `agents`.
- **FR-015**: Output generation MUST be: map `activeOrder` to snippet text, join. No group headers concept.
- **FR-016**: System MUST use `Set<id>` for membership collections and `Array<id>` only where order matters (`activeOrder`).
- **FR-017**: This feature's scope covers: (1) update all documentation (`docs/`, `CLAUDE.md`, `README.md` if present) to reflect the new entity names and data model, (2) types/interfaces, (3) Zustand store slices + Vitest unit tests. UI component updates are explicitly deferred to a follow-up feature. Within each phase, work one entity type at a time: agent, then skill, then snippet.
- **FR-018**: Agents reference snippets directly by ID. There is NO relationship between agents and skills — skills are purely a tagging/filtering mechanism for snippets.
- **FR-019**: Each store slice and its mutations MUST have unit tests using Vitest. Tests MUST cover CRUD operations, cascade deletes, index consistency (`snippetsBySkill`, `activeSet`/`activeOrder` sync), and session commit/discard.
- **FR-020**: _(Deferred)_ UI component integration tests are out of scope for this feature and will be addressed in a follow-up.
- **FR-021**: Persistence MUST use Zustand's built-in `persist` middleware with `localStorage` or `sessionStorage`. Dexie/IndexedDB is removed as the persistence layer for this feature.

### Key Entities

- **Snippet**: Atomic text content with a name and a set of skill tags. Shared across agents. Many-to-many relationship with skills.
- **Skill**: Pure tag with just an id and name. Many-to-many relationship with snippets. Alphabetical display order.
- **Agent**: Ordered collection of active snippets. Contains `activeSet` (Set for O(1) lookup) and `activeOrder` (Array for user-defined output order). Self-contained on delete.
- **snippetsBySkill** (derived): Inverse index from skill ID to Set of snippet IDs. Rebuilt on load, maintained on mutations. Enables O(1) lookup of all snippets for a given skill.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All references to "Flow" and "Group" are replaced with "Agent" and "Skill" respectively across all documentation, types, store, and UI — zero legacy naming remains.
- **SC-002**: Users can create, rename, and delete snippets, skills, and agents independently with no orphaned references after any delete operation.
- **SC-003**: Users can tag snippets with multiple skills and filter/view snippets by skill, with results appearing instantly (sub-100ms for up to 2,000 snippets).
- **SC-004**: Users can activate/deactivate snippets within an agent and reorder them, with the output window reflecting changes immediately.
- **SC-005**: Bulk skill toggle (activate/deactivate all snippets of a skill for an agent) works correctly without leaving `activeSet` and `activeOrder` out of sync.
- **SC-006**: The session draft/commit/discard model preserves data integrity — committing persists state that survives page reload; discarding reverts to last committed state exactly.
- **SC-007**: Data stored as `Map<id, Entity>` with `Set` for membership, enabling O(1) lookups for all hot-path operations.
- **SC-008**: All store mutations and cascade rules are covered by Vitest unit tests. All primary UI interactions are covered by React Testing Library integration tests. Tests pass via `make test` / `vitest run`.

## Clarifications

### Session 2026-04-19

- Q: How should existing saved data in the old format be handled? → A: No migration needed. Replace all outdated content with the new structure. Clean break.
- Q: How should the agent list be ordered in the UI? → A: Alphabetical by name.
- Q: Should the restructure include tests? → A: Yes. Vitest for store unit tests, React Testing Library for UI integration tests. Both are already installed.
- Q: What is the scope of this feature? → A: Docs + types + store + Vitest unit tests only. UI component updates are deferred to a follow-up feature.
- Q: What persistence layer should be used? → A: Zustand's built-in persist middleware. Dexie/IndexedDB is replaced.

## Assumptions

- The `OutputSettings` entity remains but `showGroupHeaders` is removed since skills are tags, not output sections.
- The `icon` and `description` fields from Flow are dropped in Agent (update.md defines Agent as having only `id`, `name`, `activeSet`, `activeOrder`).
- Import/export functionality will need updating to handle the new data shape (Maps/Sets serialized via custom serialization).
- UI component updates (renaming FlowList→AgentList, GroupsList→SkillsList, etc.) are deferred to a follow-up feature.
- Dexie/IndexedDB is removed as the persistence layer; Zustand's built-in `persist` middleware replaces it. The `src/db/database.ts` file and Dexie dependency will be removed.
- No data migration is needed. Old saved data is replaced wholesale with the new structure. Clean break — no detection, conversion, or export of legacy data.
