# Feature Specification: Snippet Skill Assignment

**Feature Branch**: `009-snippet-skill-tags`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "snippets need to be assignable to skills. when adding or editing a snippet, add a heroui taggroup which contains all skills except for untagged. the user should be able to select multiple skills to assign to a snippet. when a snippet's skills are changed, it does not appear in that skill until the changes are saved and the modal is closed."

## Clarifications

### Session 2026-04-23

- Q: Architecture — how should the TagGroup be introduced? → A: Extend `AppFormModal`, `AppFormFieldGenerator`, and `formFields.ts`. TagGroup is a new form field type (`"taggroup"`); this is its first implementation. Save fires via the `onSave` prop; close/cancel does nothing.
- Q: How should selected skill IDs be represented in the `AppFormModal` values record? → A: Comma-separated string (e.g., `"id1,id2"`). No type changes to `Record<string, string>`; split/join at call-sites.
- Q: How does the taggroup field receive its available options (the full skills list)? → A: The `FormField` definition carries `options` (all available skills as `{ id, label }[]`); `initialValues` carries the active/selected skill IDs as a comma-separated string — consistent with how name/text initial values work.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Assign Skills When Adding a Snippet (Priority: P1)

A user opens the "Add Snippet" modal to create a new snippet. Below the name and text fields, they see a tag group listing all available skills (excluding "Untagged"). The user selects one or more skills to associate with the snippet, then saves. The snippet immediately appears under the selected skills in the Skills panel.

**Why this priority**: Skill assignment at creation time is the foundational capability that makes snippets discoverable and filterable from the start.

**Independent Test**: Open the Add Snippet modal, select two skills from the tag group, save, then switch to each of those skills in the Skills panel and confirm the snippet appears.

**Acceptance Scenarios**:

1. **Given** skills exist and the Add Snippet modal is open, **When** the user selects one or more skills from the tag group and saves, **Then** the snippet is saved with those skills assigned and appears under each selected skill.
2. **Given** the Add Snippet modal is open, **When** the user saves without selecting any skill, **Then** the snippet is saved with no skills assigned and appears only under "Untagged".
3. **Given** the Add Snippet modal is open, **When** no skills exist other than "Untagged", **Then** the tag group is empty and saving proceeds normally.

---

### User Story 2 - Edit Skill Assignments on an Existing Snippet (Priority: P1)

A user opens the edit modal for an existing snippet. The tag group shows the currently assigned skills pre-selected. The user can add or remove skill assignments. The changes do not take effect in the Skills panel until the modal is saved and closed.

**Why this priority**: Without the ability to change skill assignments after creation, the feature is incomplete for any real workflow.

**Independent Test**: Open the edit modal for a snippet currently assigned to Skill A. Remove Skill A, add Skill B, save. Confirm the snippet no longer appears under Skill A and now appears under Skill B.

**Acceptance Scenarios**:

1. **Given** a snippet assigned to Skill A, **When** the user opens the edit modal, **Then** Skill A appears pre-selected in the tag group.
2. **Given** the edit modal is open with Skill A selected, **When** the user deselects Skill A and selects Skill B without saving, **Then** the snippet still appears under Skill A in the Skills panel (changes not yet committed).
3. **Given** the edit modal is open with modified skill selections, **When** the user saves and closes the modal, **Then** the snippet appears under the newly selected skills and no longer appears under removed skills.
4. **Given** the edit modal is open, **When** the user closes or cancels without saving, **Then** the original skill assignments remain unchanged.

---

### User Story 3 - Deferred Visibility Until Save (Priority: P2)

While the edit modal is open with unsaved skill changes, the snippet's skill memberships visible in the rest of the UI remain unchanged. Only upon saving does the Skills panel update to reflect new assignments.

**Why this priority**: This deferred-update behavior is explicitly required to maintain UI consistency and avoid confusing partial state during editing.

**Independent Test**: Open the edit modal, change skill assignments without saving, confirm no change in the Skills panel. Then save and confirm the panel updates.

**Acceptance Scenarios**:

1. **Given** an edit modal is open with unsaved skill changes, **When** the user inspects the Skills panel, **Then** the snippet's membership reflects its pre-edit state.
2. **Given** the user saves the modal, **When** the modal closes, **Then** the Skills panel immediately reflects the updated skill assignments.

---

### Edge Cases

- What happens when all skills are removed from a snippet? The snippet falls back to appearing under "Untagged".
- What happens if a skill is deleted while the edit modal is open? The deleted skill's tag disappears from the tag group; if it was selected, that selection is dropped on save.
- What if the user closes the modal without saving after making changes? No state changes persist.
- What if there is only one skill (besides Untagged)? The tag group renders a single selectable tag.
- What if there are no skills besides Untagged? The tag group is empty and the modal still saves successfully.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Add Snippet modal MUST include a tag group displaying all skills except "Untagged", allowing multi-select.
- **FR-002**: The Edit Snippet modal MUST include the same tag group, with currently assigned skills pre-selected as a comma-separated string in `initialValues`.
- **FR-003**: Users MUST be able to select zero or more skills from the tag group in either modal.
- **FR-004**: Skill assignment changes made inside the modal MUST NOT be reflected in the Skills panel or any other part of the UI until the modal is saved and closed.
- **FR-005**: Upon saving the modal, the snippet's skill assignments MUST be updated to exactly match the tag group selections.
- **FR-006**: If the user closes or cancels the modal without saving, skill assignments MUST remain unchanged from their pre-edit state.
- **FR-007**: If a snippet is saved with no skills selected, it MUST appear only under the "Untagged" virtual filter.
- **FR-008**: The tag group MUST exclude the "Untagged" virtual skill — it is not a real assignable skill.
- **FR-009**: The `"taggroup"` field type MUST be implemented in `formFields.ts` and `AppFormFieldGenerator` as a general-purpose extension to the form field system. `AppFormModal` MUST pass selected IDs through the existing `values: Record<string, string>` as a comma-separated string.
- **FR-010**: The `FormField` definition for a `"taggroup"` field MUST include an `options: Array<{ id: string; label: string }>` property carrying all selectable items. The caller (`Snippets.tsx`) constructs this array from the store before passing it to `AppFormModal`. `initialValues[fieldKey]` carries the pre-selected IDs as a comma-separated string.

### Key Entities

- **Snippet**: Has a `skills` property (set of skill IDs) that is updated only when modal changes are committed via save.
- **Skill**: Pure tag entity. "Untagged" is a virtual filter, not a real skill, and never appears in the assignable tag group.
- **FormField (taggroup type)**: New variant of `FormField` with `type: "taggroup"`. Carries `options: Array<{ id: string; label: string }>` for all available choices (built dynamically by the caller from the store). Value in the form system is a comma-separated string of selected IDs, passed via `initialValues` and returned via `onSave`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can assign or remove skill tags on a snippet within 3 interactions: open modal, select or deselect tags, save.
- **SC-002**: 100% of skill assignments are accurately reflected in the Skills panel immediately after the modal is saved and closed.
- **SC-003**: Unsaved skill changes produce zero visible side effects in the Skills panel — verifiable by inspection during any in-progress edit.
- **SC-004**: Snippets with no assigned skills consistently and exclusively appear under "Untagged".

## Assumptions

- "Saving" means clicking the modal's primary confirm action. Pressing Escape or clicking outside the modal counts as cancel/discard — `onSave` does not fire.
- The tag group displays skills sorted alphabetically, consistent with how skills are displayed elsewhere in the UI.
- If the skill list changes (skill added or deleted) while the modal is open, the tag group reflects the change naturally through reactivity; no special reconciliation is required.
- The comma-separated skills value in the form system is an implementation detail of the form layer. The store always receives parsed `Set<string>` — conversion happens in the `onSave` handler in `Snippets.tsx`.
