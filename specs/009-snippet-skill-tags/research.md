# Research: Snippet Skill Tags (009)

**Branch**: `009-snippet-skill-tags` | **Date**: 2026-04-23

> **Note**: An earlier draft of this file proposed a dedicated `SnippetModal` component. That approach was rejected after re-evaluation against the spec clarification (2026-04-23), which explicitly requires extending `AppFormModal`, `AppFormFieldGenerator`, and `formFields.ts` with a `"taggroup"` field type. The corrected findings are below.

---

## §1 — HeroUI TagGroup API

**Decision**: Use `TagGroup` + `Tag` from `@heroui/react` with `selectionMode="multiple"`.

**Rationale**: HeroUI's `TagGroup` wraps `react-aria-components/TagGroup`, which provides built-in `selectionMode="multiple"`, `selectedKeys` (accepts `Set<Key>`), and `onSelectionChange`. No additional dependency required. HeroUI is the project's mandated UI primitive (constitution § Tech Standards).

**API surface used**:
```tsx
import { TagGroup, Tag } from "@heroui/react";

<TagGroup
  selectionMode="multiple"
  selectedKeys={selectedKeysSet}           // Set<string> derived from comma-separated value
  onSelectionChange={(keys) => {
    const ids = keys === "all"
      ? (field.options ?? []).map((o) => o.id)
      : [...keys] as string[];
    onChange(field.key, ids.join(","));    // serialized back to comma-separated string
  }}
>
  {(field.options ?? []).map((opt) => (
    <Tag key={opt.id} id={opt.id}>{opt.label}</Tag>
  ))}
</TagGroup>
```

`UNTAGGED_SKILL_ID` (`"__untagged__"`) is not stored in `state.draft.skills`, so it never appears in the skills list and requires no special filtering.

**Alternatives considered**: Custom checkbox list — rejected; `TagGroup` is a HeroUI primitive and the spec explicitly requires it.

---

## §2 — Component Architecture

**Decision**: Extend `AppFormModal`, `AppFormFieldGenerator`, and `formFields.ts`. `"taggroup"` is implemented as a new variant of the `FormField` discriminated union. The value boundary remains `Record<string, string>` — selected skill IDs are comma-separated. `Snippets.tsx` builds the dynamic `fields` array and handles split/join in its `onSave` handlers.

**Rationale**: The spec clarification (2026-04-23) explicitly mandates this architecture. Extending the existing form field system avoids introducing a one-off component for a pattern the form system is designed to handle. The `"taggroup"` case is the first implementation and sets a reusable precedent for any future multi-select field.

The `AppFormModal` internal state (`Record<string, string>`) requires no changes — the taggroup value is stored as `"id1,id2,id3"` and deserialized at call-sites. `AppFormModal.openModal` already merges `initialValues` over defaults, so pre-selected skills work naturally.

**Earlier approach rejected**: Dedicated `SnippetModal` component — rejected because it violates the spec clarification and duplicates the form/modal machinery for a single caller.

---

## §3 — `FormField` Type Extension

**Decision**: Add `"taggroup"` to the `type` union and add `options?: Array<{ id: string; label: string }>` as an optional property on `FormField`.

**Rationale**: An optional property (rather than a full discriminated union with separate interfaces) preserves backward compatibility with all existing `FormField[]` arrays (agent, skill, snippet) at zero call-site cost. TypeScript still narrows the type correctly within the `"taggroup"` switch arm because the renderer reads `field.options` only in that branch.

**Alternatives considered**:
- Full discriminated union (`TextField | TextareaField | TagGroupField`) — rejected: breaks all existing `FormField[]` declarations; overkill for one new variant.
- Pass `options` as a separate prop to `AppFormFieldGenerator` — rejected: field definition should be self-contained per spec clarification (FR-010).

---

## §4 — Deferred Update Behaviour (FR-004)

**Decision**: Deferred updates are handled naturally by `AppFormModal`'s existing local `useState` — values live in modal state until `onSave` fires. No store changes needed for deferral.

**Rationale**: `AppFormModal` already initializes values from `initialValues` on open and only calls `onSave` on the save button. The TagGroup selection lives inside that `values` record as a comma-separated string. Nothing touches the store until `onSave` is invoked.

---

## §5 — `addSnippet` Extension for Initial Skills (Add Flow)

**Decision**: Extend `addSnippet(name, text)` to `addSnippet(name, text, skills?: Set<string>)`. The action initializes `snippetsBySkill` entries for all provided skill IDs in the same state update.

**Rationale**: The add-flow `onSave` handler in `Snippets.tsx` has parsed skill IDs from the comma-separated string and can pass them directly. Handling everything in one `set()` call avoids multiple renders and keeps the index consistent. The `addToSetIndex` utility (already used by `addTag`) is reused unchanged.

The alternative (generate UUID before calling `addSnippet`, then call `addTag` per skill) was evaluated but rejected: it requires client-side UUID generation outside the store, creates multiple synchronous state updates, and adds logic to the component that belongs in the store action.

---

## §6 — Edit Diff Strategy

**Decision**: In the edit `onSave` handler in `Snippets.tsx`, compute the diff between `snippet.skills` (pre-edit) and `newSkillIds` (post-edit from comma-separated string), then call `addTag`/`removeTag` per changed ID.

**Rationale**: No new store actions required. `addTag` and `removeTag` each produce a single state update and maintain `snippetsBySkill` correctly. The skill count per snippet is small in practice; O(n) diffing is negligible.

---

## §7 — Skills List Source

**Decision**: Use `selectSortedSkills` (exported from `useSkills.ts`) in `Snippets.tsx` to build the `options` array. Map each skill to `{ id: skill.id, label: skill.name }`.

**Rationale**: `selectSortedSkills` returns skills alphabetically from `state.draft.skills`. `UNTAGGED_SKILL_ID` is not a stored skill and will never appear. No special filtering needed.
