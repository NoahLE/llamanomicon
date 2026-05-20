# Research: Skills Section Modal Refactor

**Branch**: `007-skills-modal-refactor` | **Date**: 2026-04-22

## Summary

All technical unknowns were resolved by reading the existing codebase directly. No external research was required — the pattern to follow (`Agent.tsx`) and all shared components (`AppSection`, `AppFormModal`, `AppFormFieldGenerator`) already exist. Findings below document each decision with rationale.

---

## Decision Log

### 1. Component pattern to follow

**Decision**: Mirror `Agent.tsx` exactly.

**Rationale**: The spec explicitly calls this out (FR-001–FR-014). `Agent.tsx` is already using `AppSection`, `AppFormModal` with `triggerIcon="edit"` for inline edit, `HeroUI ListBox`, and Zustand store selectors via `useShallow`. Replicating this structure keeps UX and code consistent.

**Alternatives considered**: Keeping the old three-file pattern and adding modal-based edit — rejected because the spec requires deleting all three old files (FR-013).

---

### 2. Skill form fields

**Decision**: Use the existing `skillFormFields` export from `src/lib/formFields.ts`.

**Rationale**: `skillFormFields` is already defined with a `name` field (text, placeholder "Skill name"). The spec's add/edit modal only needs a name. No new field definitions required.

**Alternatives considered**: Creating a new minimal `skillNameFields` constant — rejected; `skillFormFields` already exists and has the right shape.

---

### 3. `activeSkillId` default value

**Decision**: Change the initial value in `createSkillsSlice` from `null` to `UNTAGGED_SKILL_ID`.

**Rationale**: FR-006 and the spec clarifications explicitly require this. The current code initializes `activeSkillId: null` (line 68 of `useSkills.ts`). After the change, `null` will never be a valid value for `activeSkillId`.

**Impact on `deleteSkill`**: The cascade in `deleteSkill` currently resets `activeSkillId` to `null` when the deleted skill was active (line 111). This must change to `UNTAGGED_SKILL_ID` to satisfy FR-011.

**Impact on `setActiveSkillId`**: The signature `(id: string | null)` can remain for backward compatibility; the component will never pass `null` after this change, but the type needn't change until a broader refactor.

**Alternatives considered**: Keeping `null` and special-casing in the component — rejected per spec clarification: "the store's initial value MUST change from `null` to `UNTAGGED_SKILL_ID`".

---

### 4. Untagged virtual item — selection behavior

**Decision**: Pass `new Set([UNTAGGED_SKILL_ID])` as the Listbox `selectedKeys` when `activeSkillId === UNTAGGED_SKILL_ID`. Use a synthetic `ListBox.Item` with `id={UNTAGGED_SKILL_ID}` pinned as the first item.

**Rationale**: `HeroUI ListBox` with `selectionMode="single"` already handles the "clicking selected item again does nothing" behavior via `disallowEmptySelection`. The `onSelectionChange` handler only needs to call `setActiveSkillId` when the incoming key differs from the current `activeSkillId`.

**Alternatives considered**: Managing selected state independently of the Listbox — rejected; the Listbox selection model is the right fit.

---

### 5. Active snippet count display

**Decision**: Use `selectSnippetCountForSkill(state, skillId)` for named skills and `selectUntaggedSnippetCount(state)` for the Untagged item. Display `{count.active}` (just the active count) in the Listbox item `Description`, matching the spec (which asks for active count, not active/total ratio).

**Rationale**: Both selectors already exist. `selectSnippetCountForSkill` returns `{ active, total }`. The old `SkillsListItem` rendered `(active/total)` — the spec only specifies showing the active count in the description, so the format can stay consistent with the Agent panel's pattern (which uses a placeholder description today).

**Alternatives considered**: Displaying `active/total` — the spec says "count of active snippets" and the Agent pattern uses a description field. Either format is defensible; the implementation should follow what displays cleanly in the Listbox `Description` slot.

---

### 6. No edit button for Untagged

**Decision**: Render the Untagged `ListBox.Item` without edit or delete buttons.

**Rationale**: Untagged is a virtual filter, not a stored entity. It has no `id` in the skills Map. FR-004 and the edge cases section in the spec both confirm this.

---

### 7. Contracts directory

**Decision**: Skip `contracts/` for this feature.

**Rationale**: This is a purely internal UI refactor with no external interfaces, APIs, or public contracts. The app exposes no endpoints and has no library API surface.

---

## Existing Assets Inventory

| Asset | Location | Status |
|---|---|---|
| `AppSection` | `src/components/AppSection.tsx` | Exists, no changes needed |
| `AppFormModal` | `src/components/AppFormModal.tsx` | Exists, supports `initialValues` |
| `skillFormFields` | `src/lib/formFields.ts` | Exists, correct shape |
| `UNTAGGED_SKILL_ID` | `src/store/useSkills.ts` | Exists |
| `selectSortedSkills` | `src/store/useSkills.ts` | Exists |
| `selectSnippetCountForSkill` | `src/store/useSkills.ts` | Exists |
| `selectUntaggedSnippetCount` | `src/store/useSnippets.ts` | Exists |
| `addSkill` / `updateSkill` / `deleteSkill` | `src/store/useSkills.ts` | Exists |
| `setActiveSkillId` | `src/store/useSkills.ts` | Exists |
| `HeroUI ListBox` | `@heroui/react` | Already imported in Agent.tsx |
| `Trash2`, `Edit` icons | `lucide-react` | Already used in Agent.tsx |

## Files to Delete

| File | Reason |
|---|---|
| `src/components/SkillsList.tsx` | Replaced by `Skills.tsx` (FR-013) |
| `src/components/SkillsListItem.tsx` | Replaced by `Skills.tsx` (FR-013) |
| `src/components/SkillsListItemEdit.tsx` | Replaced by `Skills.tsx` (FR-013) |
| `src/components/tests/SkillsList.test.tsx` | Test file for deleted component |
| `src/components/tests/SkillsListItem.test.tsx` | Test file for deleted component |
