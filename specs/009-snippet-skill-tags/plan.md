# Implementation Plan: Snippet Skill Assignment

**Branch**: `009-snippet-skill-tags` | **Date**: 2026-04-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/009-snippet-skill-tags/spec.md`

## Summary

Add a HeroUI `TagGroup` to the Add and Edit Snippet modals so users can assign skills to snippets at create/edit time. The `FormField` type is extended with a `"taggroup"` variant (carrying `options: Array<{ id: string; label: string }>`), `AppFormFieldGenerator` renders it, and `Snippets.tsx` builds the dynamic field from the store and handles split/join at the boundary.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode, `noUncheckedIndexedAccess: true`)  
**Primary Dependencies**: React 19, HeroUI, Zustand 5, Vite 7  
**Storage**: Zustand `draft` slice → localStorage via `persist` middleware; no new persistence surface  
**Testing**: Vitest 4 + React Testing Library  
**Target Platform**: Browser (PWA, offline-first)  
**Project Type**: Web application (single-page PWA)  
**Performance Goals**: 60 fps; all mutations are synchronous local state — no async overhead  
**Constraints**: Offline-capable; no server calls; `Record<string, string>` form values boundary preserved  
**Scale/Scope**: Small UI extension across 4 existing files; no new files required

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                | Check                                                                                                  | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| I. Code Quality          | TypeScript strict, no `any`, single responsibility per unit, active dead-code removal + simplification | ✅     |
| II. UX Consistency       | Dark-first; TagGroup follows existing HeroUI pattern — no new motion or layout precedent set           | ✅     |
| III. Performance         | All mutations synchronous local state; no bundle additions; PWA unaffected                             | ✅     |
| IV. Living Documentation | CLAUDE.md `Recent Changes` entry already exists for 009; docs/ changes scoped to models.md if needed  | ✅     |
| V. Simplicity & DRY      | No new abstractions; taggroup is a new variant of the existing `FormField` discriminated union         | ✅     |
| VI. Testing Discipline   | Tests go in `src/components/tests/` and `src/store/tests/`; AAA; native store actions for setup        | ✅     |
| Tech Standards           | HeroUI TagGroup (not custom); Zustand slice; Vitest + RTL; no new dependencies                        | ✅     |
| V1 Scope Gate            | No node graph, no GSAP, no neoskeumorphic styling introduced                                           | ✅     |

All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/009-snippet-skill-tags/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

No contracts/ directory — this project has no external API surface.

### Source Code (affected files only)

```text
src/
├── lib/
│   └── formFields.ts               # Extend FormField: "taggroup" type + options field
├── components/
│   ├── AppFormFieldGenerator.tsx   # Add "taggroup" case → renders HeroUI TagGroup
│   └── Snippets.tsx                # Build dynamic fields with taggroup; onSave diff logic
└── store/
    └── useSnippets.ts              # Extend addSnippet to accept initial skills Set
```

**Structure Decision**: Single-project; all changes are extensions of existing files. No new files needed — `"taggroup"` is a new variant of the existing `FormField` discriminated union and slots naturally into the existing renderer and modal machinery.

## Complexity Tracking

> No constitution violations — table not required.

---

## Phase 0: Research

> All items researched and resolved. See [research.md](./research.md) for full findings.

| Question | Resolution |
| -------- | ---------- |
| HeroUI TagGroup API and multi-select usage | Resolved — see research.md §1 |
| `addSnippet` extension strategy (skills on create) | Resolved — see research.md §2 |
| Edit diff strategy (addTag / removeTag) | Resolved — see research.md §3 |
| `FormField` discriminated union pattern | Resolved — see research.md §4 |

---

## Phase 1: Design

### Data Model

> Full entity definitions in [data-model.md](./data-model.md).

**`FormField` type** (`src/lib/formFields.ts`) — only change to data layer:

```ts
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
  options?: Array<{ id: string; label: string }>; // only used when type === "taggroup"
}
```

All other entity types (`Snippet`, `Skill`, `Agent`) are unchanged. `Snippet.skills: Set<string>` already holds the assignments.

### Contracts

Internal application only — no external API surface. No contracts/ directory needed.

### Component Design

#### `AppFormFieldGenerator.tsx` — new `"taggroup"` case

The existing switch statement gains a `"taggroup"` arm. It renders a HeroUI `TagGroup` in multi-select mode. Selected IDs flow as a `Selection` (Set-like), serialized to a comma-separated string via `onChange(field.key, [...keys].join(","))`. The component receives the current value as a comma-separated string and deserializes it for `selectedKeys`.

```tsx
case "taggroup": {
  const selectedKeys = new Set(value ? value.split(",").filter(Boolean) : []);
  return (
    <TagGroup
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        const ids = keys === "all"
          ? (field.options ?? []).map((o) => o.id)
          : [...keys] as string[];
        onChange(field.key, ids.join(","));
      }}
    >
      {(field.options ?? []).map((opt) => (
        <Tag key={opt.id} id={opt.id}>{opt.label}</Tag>
      ))}
    </TagGroup>
  );
}
```

#### `Snippets.tsx` — dynamic fields + `onSave` handlers

The static `snippetFormFields` import is used for the first two fields (name, text). A third field — the taggroup — is constructed at render time using the sorted skills list from the store (UNTAGGED_SKILL_ID excluded):

```ts
const sortedSkills = useAppStore(useShallow(selectSortedSkills));
const skillOptions = sortedSkills
  .filter((s) => s.id !== UNTAGGED_SKILL_ID)
  .map((s) => ({ id: s.id, label: s.name }));

const snippetFields: FormField[] = [
  ...snippetFormFields,
  { key: "skills", label: "Skills", type: "taggroup", options: skillOptions },
];
```

**Add modal `onSave`**:
```ts
onSave={(v) => {
  if (v.name && v.text) {
    const skillIds = v.skills
      ? new Set(v.skills.split(",").filter(Boolean))
      : new Set<string>();
    addSnippet(v.name, v.text, skillIds);
  }
}}
```

**Edit modal `onSave`** (inside `SnippetItem`, receives `snippet` in closure):
```ts
onSave={(v) => {
  updateSnippet(snippet.id, { name: v.name ?? "", text: v.text ?? "" });
  const newSkillIds = new Set((v.skills ?? "").split(",").filter(Boolean));
  for (const id of newSkillIds) {
    if (!snippet.skills.has(id)) addTag(snippet.id, id);
  }
  for (const id of snippet.skills) {
    if (!newSkillIds.has(id)) removeTag(snippet.id, id);
  }
}}
```

**Edit modal `initialValues`**:
```ts
initialValues={{
  name: snippet.name,
  text: snippet.text,
  skills: [...snippet.skills].join(","),
}}
```

#### `useSnippets.ts` — extend `addSnippet`

`addSnippet` gains an optional third parameter `skills?: Set<string>`. When provided, the action builds the `snippetsBySkill` index entries in the same state update (no extra dispatches):

```ts
addSnippet: (name, text, skills = new Set<string>()) => {
  const snippet = repo.create(name, { text, skills });
  set((storeState) => {
    let snippetsBySkill = storeState.snippetsBySkill;
    for (const skillId of skills) {
      snippetsBySkill = addToSetIndex(snippetsBySkill, skillId, snippet.id);
    }
    return {
      draft: {
        ...storeState.draft,
        snippets: repo.add(storeState.draft.snippets, snippet),
      },
      snippetsBySkill,
    };
  });
},
```

The `SnippetsSlice` interface is updated to match: `addSnippet: (name: string, text: string, skills?: Set<string>) => void`.

### Quickstart

> Full developer quickstart in [quickstart.md](./quickstart.md).

Short version: no migrations, no new dependencies, no config changes. Run `make dev`, open a snippet modal, select skills from the tag group, save — done.
