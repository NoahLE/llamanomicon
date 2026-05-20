# Feature Specification: Output Skill Accordions

**Feature Branch**: `010-output-skill-accordions`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "the output section captures the active snippets and the groups they're contained in. this update will handle the rendering of those. each section in the output will be an accordion with the heading being the skill name and the body being the active snippets from that skill. this will be implemented using the heroui. each accordion item should be drag and droppable. by default all accordion items should be expanded."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Active Snippets Grouped by Skill (Priority: P1)

A user with an active agent and several active snippets tagged to different skills opens the Output Window. Instead of seeing a flat compiled text block, they see skill-labeled accordion sections — one per skill that has at least one active snippet — with each section listing the snippets belonging to that skill. All sections are expanded by default.

**Why this priority**: This is the core visual transformation the feature delivers. Without this, no other part of the feature has context.

**Independent Test**: Can be fully tested by activating snippets from multiple different skills and verifying the Output Window renders grouped accordion sections with correct headings and content.

**Acceptance Scenarios**:

1. **Given** an agent is active with snippets from two different skills activated, **When** the Output Window is viewed, **Then** two accordion sections appear, each labeled with the skill name, each containing only the snippets tagged to that skill, and both sections are expanded by default.
2. **Given** an agent has active snippets with no skill tags, **When** the Output Window is viewed, **Then** an "Untagged" accordion section appears containing those snippets.
3. **Given** a skill has snippets but none are active for the current agent, **When** the Output Window is viewed, **Then** no accordion section appears for that skill.
4. **Given** no agent is selected, **When** the Output Window is viewed, **Then** the existing empty-state message is shown ("Select an agent to get started").
5. **Given** an agent is selected but no snippets are active, **When** the Output Window is viewed, **Then** the existing empty-state message is shown ("Toggle snippets to build your prompt").

---

### User Story 2 - Reorder Skill Groups via Drag and Drop (Priority: P2)

A user wants to control the order in which skill groups appear in the output. They drag an accordion section to a new position among the other sections. The compiled output reflects the new group order when copied.

**Why this priority**: Ordering is essential for prompt composition — users structure their prompts intentionally. Without reordering, the output order is undefined or arbitrary.

**Independent Test**: Can be fully tested by dragging a skill group to a new position and verifying the copy-to-clipboard output reflects the updated ordering.

**Acceptance Scenarios**:

1. **Given** multiple skill group accordions are visible, **When** a user drags a section to a new position, **Then** the sections reorder visually and the compiled output reflects that new order.
2. **Given** a user has reordered skill groups, **When** they copy the output, **Then** the copied text contains snippets in the new skill group order (all snippets from group 1, then group 2, etc.).
3. **Given** a user has reordered skill groups, **When** they discard session changes, **Then** the skill group order reverts to the previous saved state.

---

### User Story 3 - Copy Compiled Output in Current Order (Priority: P3)

A user copies the compiled output after arranging their skill group sections. The clipboard receives plain text with snippets ordered by the current skill group arrangement.

**Why this priority**: Clipboard copy is the terminal action in the core loop. It must continue to work after the visual redesign.

**Independent Test**: Can be fully tested by verifying the Copy button produces text that matches the displayed accordion order.

**Acceptance Scenarios**:

1. **Given** skill group accordions are displayed in a specific order, **When** the user clicks Copy, **Then** the clipboard contains snippets joined in skill-group order (group 1 snippets first, then group 2, etc.) using the configured snippet separator.
2. **Given** no active snippets exist, **When** the Copy button is shown, **Then** it is disabled and produces no clipboard action.

---

### Edge Cases

- What happens when a snippet is tagged to multiple skills? It appears visually under every skill group it belongs to, but is included only once in the compiled output — at the position of its first matching skill group.
- What happens when only one skill group exists? The drag handle should still render but dragging has no visible effect.
- What happens when a skill is renamed while the output is visible? The accordion heading should update to the new name immediately.
- What happens when a user collapses an accordion section manually? The collapsed state should persist within the session but need not survive a page reload.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Output Window MUST display active snippets grouped into accordion sections, one per skill that has at least one active snippet for the current agent.
- **FR-002**: Each accordion section MUST display the skill name as its heading.
- **FR-003**: All accordion sections MUST be expanded by default when rendered.
- **FR-004**: Snippets with no skill tags MUST be grouped in a dedicated "Untagged" section, positioned after all named skill sections.
- **FR-005**: Skills with no active snippets for the current agent MUST NOT appear as sections in the Output Window.
- **FR-006**: Each accordion section MUST be draggable relative to other sections to allow the user to change the group order.
- **FR-007**: Reordering skill group sections MUST update the compiled output so snippets are emitted in the new group order.
- **FR-008**: The Copy button MUST compile and copy output in the current skill group order, using the configured snippet separator.
- **FR-009**: Drag-and-drop group ordering changes MUST apply to the session state and participate in the existing save/discard session model.
- **FR-010**: A snippet tagged to multiple skills MUST appear visually under every skill group it belongs to. In the compiled output it MUST be included only once, at the position determined by its first matching skill group.

### Key Entities

- **Skill Group**: A logical grouping of active snippets sharing a skill tag; rendered as an accordion section in the Output Window. Ordered by user-defined drag position.
- **Untagged Group**: A virtual skill group for active snippets with no skill tags; always appears last by default if any such snippets exist.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can visually identify which skill each active snippet belongs to without leaving the Output Window.
- **SC-002**: Users can reorder skill groups with a single drag interaction, and the compiled copy reflects the new order immediately.
- **SC-003**: All active snippets present in the agent are accounted for in the Output Window with no omissions. Snippets tagged to multiple skills appear in each matching group visually but are compiled into the output exactly once.
- **SC-004**: The Copy button continues to produce correctly ordered plain text after any drag reordering of skill groups.
- **SC-005**: The Output Window renders the correct groupings within one render cycle of any snippet activation or deactivation event.

## Assumptions

- Drag-and-drop of individual snippets within a skill group is out of scope; only skill group sections are draggable.
- Snippet ordering within each skill group follows the relative ordering established in the agent's existing active order.
- The "Untagged" group appears after all named skill groups when present.
- The collapsed/expanded state of individual accordion sections is session-local UI state and is not persisted to the store.
- The exact persistence mechanism for skill group ordering (e.g., a new field on Agent or derivation from activeOrder) is an implementation concern deferred to the plan phase.
