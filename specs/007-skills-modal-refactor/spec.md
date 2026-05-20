# Feature Specification: Skills Section Modal Refactor

**Feature Branch**: `007-skills-modal-refactor`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: Refactor the Skills section to match the Agent component pattern: single `Skills.tsx` file using HeroUI Listbox, AppFormModal for add/edit, AppSection wrapper, store-wired selection with active snippet count in item descriptions.

## Clarifications

### Session 2026-04-22

- Q: What happens when the user clicks the already-active skill? → A: Nothing — the active skill cannot be deselected by clicking it again.
- Q: Which skill is active by default on app load? → A: "Untagged" is always active by default (`activeSkillId` initializes to `UNTAGGED_SKILL_ID`).
- Q: What does the Untagged filter display? → A: All snippets that have no skill assigned to them.
- Q: Do active counts reflect the currently selected agent? → A: Yes — the active count for each skill updates whenever the selected agent changes.
- Q: Should CSS/design styles be added in this implementation? → A: No — focus on functionality only; do not add design CSS.
- Q: Where should `activeSkillId` default to `UNTAGGED_SKILL_ID`? → A: In the store — change the store's initial value from `null` to `UNTAGGED_SKILL_ID` so `null` is never a valid state.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View and Activate a Skill (Priority: P1)

A user opens the app and sees the Skills panel. "Untagged" is active by default, filtering the Snippets panel to show only snippets with no skill assigned. The user clicks a different skill to activate it, which immediately filters the Snippets panel. Only one skill is active at a time. Clicking the already-active skill does nothing.

**Why this priority**: Activation is the core interaction of the Skills panel — it drives snippet filtering. Everything else depends on the list rendering and selection working correctly.

**Independent Test**: Open the app. Verify "Untagged" is active by default and the Snippets panel shows untagged snippets. Click a named skill — verify it becomes active and the store's `activeSkillId` reflects it. Click the same skill again — verify nothing changes.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** the Skills panel renders, **Then** "Untagged" is the active skill and `activeSkillId` equals `UNTAGGED_SKILL_ID`.
2. **Given** the app has skills, **When** the Skills panel loads, **Then** all skills are listed in alphabetical order with "Untagged" pinned at the top.
3. **Given** no named skill is active, **When** the user clicks a skill, **Then** that skill becomes active and `activeSkillId` is set to its ID.
4. **Given** a skill is active, **When** the user clicks a different skill, **Then** the first deactivates and the new skill becomes active.
5. **Given** a skill is active, **When** the user clicks the same already-active skill, **Then** the active skill does not change.

---

### User Story 2 - View Active Snippet Count per Skill (Priority: P1)

Each skill entry in the list shows how many of its tagged snippets are currently active in the selected agent. This count updates whenever the user selects a different agent.

**Why this priority**: Existing feature requirement; supports informed skill selection and provides live feedback about the current agent's composition.

**Independent Test**: Open the app with an agent that has some snippets activated. Verify each skill item shows the count of active snippets for that agent. Switch agents — verify counts update.

**Acceptance Scenarios**:

1. **Given** an agent is selected and has snippets activated, **When** the Skills panel renders, **Then** each skill item displays the count of active snippets tagged with that skill for the current agent.
2. **Given** a skill has no active snippets in the current agent, **When** the list renders, **Then** the skill shows 0 as its active count.
3. **Given** the user selects a different agent, **When** the panel re-renders, **Then** each skill's active count updates to reflect the new agent's active snippets.

---

### User Story 3 - Add a Skill via Modal (Priority: P2)

A user clicks an "add" button in the Skills panel header controls to open a modal form. They type a skill name and confirm to create the new skill, which immediately appears in the list.

**Why this priority**: Creating skills is necessary for tagging snippets. The modal pattern keeps the UI consistent with the Agent panel.

**Independent Test**: Click the add button in the Skills panel header. Fill in a name and submit. Verify the new skill appears in the alphabetically sorted list.

**Acceptance Scenarios**:

1. **Given** the Skills panel is visible, **When** the user clicks the add button in the controls, **Then** a modal form opens with a name field.
2. **Given** the modal is open with a valid name entered, **When** the user submits, **Then** the modal closes and the new skill appears in the list.
3. **Given** the modal is open with an empty name, **When** the user submits, **Then** the skill is not created (matching existing modal behavior).

---

### User Story 4 - Edit a Skill Name via Modal (Priority: P2)

A user clicks an edit button on a skill item to open a pre-populated modal form. They update the name and confirm to rename the skill, which updates immediately in the list.

**Why this priority**: Supports correcting skill names without deleting and recreating.

**Independent Test**: Click the edit button on an existing skill. Verify the modal opens with the current name pre-filled. Change the name and submit. Verify the list updates.

**Acceptance Scenarios**:

1. **Given** a skill exists in the list, **When** the user clicks its edit button, **Then** the modal opens with the skill's current name pre-populated.
2. **Given** the edit modal is open with a changed name, **When** the user submits, **Then** the skill is renamed and the updated name appears in the list.

---

### User Story 5 - Delete a Skill (Priority: P3)

A user clicks a delete button on a skill item to remove it. The skill is removed from the list and from all snippets that had it tagged (cascade delete per existing store behavior).

**Why this priority**: Destructive action — important but lower risk than the core selection and add flows.

**Independent Test**: Click the delete button on a skill. Verify it disappears from the list. Verify snippets previously tagged with it no longer reference it.

**Acceptance Scenarios**:

1. **Given** a skill exists, **When** the user clicks its delete button, **Then** the skill is removed from the list.
2. **Given** the deleted skill was the active skill, **When** it is deleted, **Then** `activeSkillId` reverts to `UNTAGGED_SKILL_ID`.

---

### Edge Cases

- What happens when no named skills exist? The list shows only the "Untagged" virtual entry, which remains active.
- What happens when the "Untagged" entry is clicked while it is already active? Nothing — the active skill does not change.
- What happens if the user adds a skill with a duplicate name? The store allows it (no uniqueness constraint); the new skill is created.
- What happens when a skill with zero snippets is deleted? It is removed cleanly with no cascade side effects.
- The "Untagged" entry does not expose edit or delete buttons — it is a virtual filter, not a stored entity.
- When no agent is selected, active counts display 0 for all skills.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Skills section MUST be implemented as a single `Skills.tsx` file, replacing all existing skills component files.
- **FR-002**: The Skills panel MUST use the `AppSection` component as its wrapper with "Skills" as the title.
- **FR-003**: The Skills panel MUST use a HeroUI Listbox to render skills, with single-selection behavior.
- **FR-004**: The Listbox MUST include "Untagged" as a pinned first item backed by the `UNTAGGED_SKILL_ID` constant. When active, Untagged filters the Snippets panel to show only snippets with no skill assigned.
- **FR-005**: Each Listbox item MUST display the skill name and the active snippet count for the current agent in the item description. The count MUST update when the active agent changes.
- **FR-006**: The store MUST initialize `activeSkillId` to `UNTAGGED_SKILL_ID` (not `null`) so Untagged is always active from the start. `null` is not a valid value for `activeSkillId`.
- **FR-007**: Clicking a skill that is not currently active MUST set `activeSkillId` to that skill's ID. Clicking an already-active skill MUST do nothing.
- **FR-008**: The panel header controls MUST include an add button that opens an `AppFormModal` for creating a new skill.
- **FR-009**: Each named skill item MUST have an edit button that opens an `AppFormModal` pre-populated with the skill's current name.
- **FR-010**: Each named skill item MUST have a delete button that removes the skill via the store.
- **FR-011**: When the active skill is deleted, `activeSkillId` MUST revert to `UNTAGGED_SKILL_ID`.
- **FR-012**: The existing standalone "add skill" button inside the old SkillsList MUST be removed.
- **FR-013**: The files `SkillsList.tsx`, `SkillsListItem.tsx`, and `SkillsListItemEdit.tsx` MUST be deleted.
- **FR-014**: The new `Skills.tsx` MUST be wired into the existing app layout in place of the old skills components.
- **FR-015**: No design CSS MUST be added in this implementation; the focus is functional wiring only.

### Key Entities

- **Skill**: An entity with `id` and `name`. Many-to-many relationship with Snippets via snippet `skills: Set<string>`. Referenced by `activeSkillId` in session state.
- **activeSkillId**: Session state (`string`) indicating which skill is currently active. Stored in the skills slice with an initial value of `UNTAGGED_SKILL_ID` (`"__untagged__"`). `null` is not a valid value — there is always an active skill.
- **Active snippet count**: For a given skill and active agent, the count of snippets tagged with that skill that are currently in the agent's `activeSet`. Derived via `selectSnippetCountForSkill` (returns `{ active, total }`); the `active` field is displayed.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The Skills panel structure mirrors the Agent panel — both use AppSection, AppFormModal, and HeroUI Listbox with consistent interaction patterns.
- **SC-002**: On app load, "Untagged" is active and the Snippets panel shows only snippets with no skill assigned.
- **SC-003**: Clicking a skill immediately activates it; clicking the already-active skill produces no change.
- **SC-004**: Active snippet counts in the Skills panel update immediately when the selected agent changes.
- **SC-005**: Adding, editing, and deleting skills all persist correctly through the draft/save/discard cycle.
- **SC-006**: No skills-related functionality from the old components is lost — view, activate, add, edit, delete, and active count display all remain available.
- **SC-007**: The codebase contains no references to the deleted component files after the refactor is complete.

## Constraints

- No design CSS to be added in this implementation. Existing styles from AppSection, AppFormModal, and HeroUI Listbox are acceptable as structural defaults.

## Assumptions

- The active count displayed per skill is the `active` field from `selectSnippetCountForSkill(state, skillId)`, reflecting how many of that skill's snippets are currently in the active agent's `activeSet`.
- Edit and delete buttons are rendered inside each ListboxItem using the same icon/button pattern used in Agent.tsx.
- The `AppFormModal` already supports pre-populated `initialValues` for the edit case.
- The "Untagged" entry does not show edit or delete actions.
- No confirmation dialog is required for skill deletion, matching existing Agent behavior.
- The store's `activeSkillId` initial value MUST change from `null` to `UNTAGGED_SKILL_ID`. The component does not need to handle a `null` fallback.
