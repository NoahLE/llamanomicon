# Data Model: Snippet Skill Tags (009)

**Branch**: `009-snippet-skill-tags` | **Date**: 2026-04-23

> **Note**: An earlier draft of this file described transient `SnippetModal` local state. That was superseded by the spec-mandated architecture (extend `AppFormModal` / `AppFormFieldGenerator` / `formFields.ts`). The corrected model is below.

---

## Existing Entities (unchanged)

### Snippet

```ts
interface Snippet extends Entity {
  name: string;
  text: string;
  skills: Set<string>;  // Set of skill IDs — no schema change
}
```

No migration required. `skills` already exists and is persisted via the custom Map/Set serializer in `src/lib/serialization.ts`.

### Skill

```ts
interface Skill extends Entity {
  id: string;
  name: string;
}
```

No change. `UNTAGGED_SKILL_ID = "__untagged__"` is a virtual constant — never stored in `state.draft.skills`.

---

## `FormField` Type Extension (only schema change in this feature)

```ts
// src/lib/formFields.ts

// Before
export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea";
  defaultValue?: string;
  placeholder?: string;
}

// After
export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "taggroup";
  defaultValue?: string;
  placeholder?: string;
  options?: Array<{ id: string; label: string }>;  // only meaningful when type === "taggroup"
}
```

The `options` property is optional so all existing `FormField[]` definitions (agent, skill, snippet) require zero changes.

---

## Transient Form State (inside `AppFormModal`)

`AppFormModal` manages `values: Record<string, string>` in local `useState`. For the taggroup field, the value is a **comma-separated string of selected skill IDs** (e.g., `"id1,id2"`). This is the only transient state — it lives in the modal component and is discarded on cancel.

| Field     | Key in `values`  | Type in form system | Encoding               |
| --------- | ---------------- | ------------------- | ---------------------- |
| Name      | `"name"`         | `string`            | Plain string           |
| Text      | `"text"`         | `string`            | Plain string           |
| Skills    | `"skills"`       | `string`            | Comma-separated IDs    |

**On open (add)**: `initialValues` is undefined → `values.skills` defaults to `""` (empty).  
**On open (edit)**: `initialValues.skills = [...snippet.skills].join(",")` → pre-selects current assignments.  
**On cancel/escape**: Modal state is discarded; store unchanged.  
**On save**: `onSave(values)` fires; caller (`Snippets.tsx`) splits `values.skills` and calls store actions.

---

## Derived Index (unchanged)

`snippetsBySkill: Map<string, Set<string>>` — rebuilt on hydration; updated by `addTag`, `removeTag`, `addSnippet` (with skills), `deleteSnippet`, and `deleteSkill`. No change to structure or rebuild logic.

---

## Store Actions Used

| Action                                       | When called                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `addSnippet(name, text, skills?)`            | Add flow: creates snippet + initializes index entries atomically          |
| `updateSnippet(id, { name, text })`          | Edit flow: updates name/text                                             |
| `addTag(snippetId, skillId)`                 | Edit flow save: for each skillId added vs. pre-edit `snippet.skills`     |
| `removeTag(snippetId, skillId)`              | Edit flow save: for each skillId removed vs. pre-edit `snippet.skills`   |

**`addSnippet` signature change** (`src/store/useSnippets.ts`):
```ts
// Before
addSnippet: (name: string, text: string) => void

// After
addSnippet: (name: string, text: string, skills?: Set<string>) => void
```

Internal implementation adds `snippetsBySkill` index entries for all provided skill IDs in the same `set()` call. Default is `new Set<string>()` — no behavior change for existing callers.

---

## State Transitions

```
Modal opens (add)
  → AppFormModal initializes values: { name: "", text: "", skills: "" }

Modal opens (edit)
  → AppFormModal initializes values:
      { name: snippet.name, text: snippet.text, skills: [...snippet.skills].join(",") }

User interacts with TagGroup
  → AppFormModal.values.skills updates (comma-separated string); store unchanged

User clicks Cancel / presses Escape
  → Modal closes; AppFormModal state discarded; store unchanged

User clicks Save (add)
  → Snippets.tsx onSave: parse skills string → Set<string>
  → addSnippet(name, text, skillIds) — one atomic store update
  → modal closes

User clicks Save (edit)
  → Snippets.tsx onSave:
      updateSnippet(id, { name, text })
      newSkillIds = new Set(skills.split(",").filter(Boolean))
      diff vs snippet.skills:
        added = newSkillIds \ snippet.skills → addTag(id, skillId) for each
        removed = snippet.skills \ newSkillIds → removeTag(id, skillId) for each
  → modal closes
```
