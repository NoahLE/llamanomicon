# Feature Specification: Skill Active Snippet Count

**Feature Branch**: `001-skill-active-count`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "when a group has active snippets, the count should be visible in the skill row. for example, the row would say 'computer styling' for the skill name and have a (1/5) to indicate one out of the 5 text snippets is active."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Active Counts in Skill List (Priority: P1)

A user is composing a prompt and wants to know at a glance how many snippets are activated per skill group without clicking into each one. They look at the Skills List panel and see each skill row now shows "(active/total)" next to its name — for example, "Computer Styling (1/5)".

**Why this priority**: This is the entire scope of the feature. All value is delivered by this single behavior being present and accurate.

**Independent Test**: Can be fully tested by opening the app with an agent selected, activating some snippets, and verifying that each skill row in the Skills List panel shows the correct "(active/total)" count.

**Acceptance Scenarios**:

1. **Given** an agent is selected and 1 of 5 snippets tagged with "Computer Styling" is active, **When** the user views the Skills List panel, **Then** the "Computer Styling" row displays "(1/5)" alongside the skill name.
2. **Given** no snippets tagged with a skill are active, **When** the user views the Skills List panel, **Then** that skill row displays "(0/N)" where N is the total snippet count for that skill.
3. **Given** all snippets for a skill are active, **When** the user views the Skills List panel, **Then** that skill row displays "(N/N)" where N is the total count.

---

### User Story 2 - Count Updates Live on Toggle (Priority: P2)

A user activates or deactivates a snippet in the Snippets Panel. Without any page reload or navigation, the active count displayed on the corresponding skill row updates immediately to reflect the new state.

**Why this priority**: Correctness of the count in real time is required for it to be trusted as a status indicator. A stale count is misleading.

**Independent Test**: Can be fully tested by toggling a snippet on/off and observing the skill row count increment/decrement in the same view.

**Acceptance Scenarios**:

1. **Given** a skill row shows "(1/5)", **When** the user activates a second snippet tagged with that skill, **Then** the row immediately updates to "(2/5)".
2. **Given** a skill row shows "(2/5)", **When** the user deactivates one of those snippets, **Then** the row immediately updates to "(1/5)".

---

### User Story 3 - Count Reflects the Active Agent (Priority: P3)

A user switches between agents. The active counts in the Skills List update to reflect which snippets are active in the newly selected agent, not the previous one.

**Why this priority**: Counts must be scoped to the current agent context. A user managing multiple agents depends on the count being accurate for the agent they are currently editing.

**Independent Test**: Can be fully tested by creating two agents with different active snippets for the same skill, switching between them, and verifying the count changes accordingly.

**Acceptance Scenarios**:

1. **Given** Agent A has 2 active snippets for "Writing Style" and Agent B has 0, **When** the user selects Agent B, **Then** the "Writing Style" row shows "(0/N)".
2. **Given** Agent B is selected with "(0/N)", **When** the user switches to Agent A, **Then** the "Writing Style" row updates to "(2/N)".

---

### Edge Cases

- What happens when a skill has no snippets tagged to it? The count displays "(0/0)".
- What happens when no agent is selected? Active counts default to "(0/N)" since there is no active set context.
- What happens with the "Untagged" virtual skill filter? It displays an active/total count the same as named skills, calculated from snippets with no tags.
- What happens when a snippet is deleted? All affected skill row counts update immediately to reflect the reduced total.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Each skill row in the Skills List panel MUST display the count of active snippets for the currently selected agent out of the total snippets tagged with that skill, in the format "(active/total)".
- **FR-002**: The active/total count MUST appear visually alongside the skill name within the same row.
- **FR-003**: The displayed count MUST update immediately — without page reload — whenever a snippet is activated, deactivated, added, removed, or re-tagged.
- **FR-004**: The active count MUST be scoped to the currently selected agent's active snippet set; switching agents MUST update all skill row counts.
- **FR-005**: When no agent is selected, the active portion of the count MUST display as 0 for all skills.
- **FR-006**: The "Untagged" virtual skill row MUST display an active/total count calculated from snippets that have no skill tags.
- **FR-007**: A skill with zero tagged snippets MUST display "(0/0)".

### Key Entities

- **Skill**: A tag grouping snippets. Gains a derived display property: the count of its tagged snippets that appear in the active agent's active set, and the total count of its tagged snippets.
- **Agent**: Determines which snippets are "active" via its active snippet set. Changing the selected agent changes all skill row counts.
- **Snippet**: Tagged with zero or more skills. When activated or deactivated within an agent, the counts for all skills it belongs to must reflect the change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of skill rows display an accurate "(active/total)" count at all times while an agent is selected.
- **SC-002**: Count values update within one render cycle after any snippet activation, deactivation, addition, deletion, or re-tagging — no manual refresh required.
- **SC-003**: Users can identify which skills have any active snippets without opening the Snippets Panel, reducing navigation steps by at least 1 per skill assessment.
- **SC-004**: Counts remain accurate across all agent switches — 0 discrepancies between displayed count and actual active snippet state.

## Assumptions

- The "(active/total)" format shown in the example ("1/5") is the accepted display format; no alternative format (e.g., a progress bar or percentage) is needed for this feature.
- Counts are display-only — clicking the count does not trigger any action.
- The count is visible at all times in the skill row, not only on hover.
- The "Untagged" virtual skill row follows the same count display rules as named skills.
- Selector functions are co-located in their owning slice file — there is no standalone `src/store/selectors.ts`. New selectors (`selectSnippetCountForSkill`, `selectUntaggedSnippetCount`) must be added to `src/store/useSkills.ts` and `src/store/useSnippets.ts` respectively, following the pattern established in the merged store refactor.

## Clarifications

### Session 2026-04-21

- Q: A merge removed `src/store/selectors.ts` and moved all selector functions into their owning slice files — where should the two new feature selectors be placed? → A: `selectSnippetCountForSkill` → `src/store/useSkills.ts`; `selectUntaggedSnippetCount` → `src/store/useSnippets.ts`. Tests for each go into `src/store/tests/useSkills.test.ts` and `src/store/tests/useSnippets.test.ts` respectively. The standalone `src/store/tests/selectors.test.ts` file referenced in plan.md and tasks.md no longer exists and must not be created.
