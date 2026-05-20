# Quickstart: Skills Section Modal Refactor

**Branch**: `007-skills-modal-refactor`

## What this feature does

Replaces the old three-file Skills component hierarchy with a single `Skills.tsx` that mirrors the `Agent.tsx` pattern. The new component uses `AppSection`, HeroUI `Listbox`, and `AppFormModal` for add/edit actions. The store is updated so `activeSkillId` always defaults to `UNTAGGED_SKILL_ID` rather than `null`.

## Setup

```bash
git checkout 007-skills-modal-refactor
make install   # npm install
make dev       # starts http://localhost:5173
```

## Development workflow

```bash
make lint      # ESLint + Prettier auto-fix (run before committing)
npm test       # run all tests once
npm run test:watch   # Vitest watch mode
```

## Key files

| File | Purpose |
|---|---|
| `src/components/Skills.tsx` | **NEW** — the replacement component |
| `src/components/Agent.tsx` | **Reference** — the pattern to mirror |
| `src/store/useSkills.ts` | Store slice — two-line fix for `activeSkillId` default |
| `src/lib/formFields.ts` | `skillFormFields` — already defined, use as-is |
| `src/components/AppSection.tsx` | Shared panel wrapper |
| `src/components/AppFormModal.tsx` | Shared add/edit modal |

## Files to delete

```
src/components/SkillsList.tsx
src/components/SkillsListItem.tsx
src/components/SkillsListItemEdit.tsx
src/components/tests/SkillsList.test.tsx
src/components/tests/SkillsListItem.test.tsx
```

## Store changes

In `src/store/useSkills.ts`:

1. **Line 68**: Change `activeSkillId: null` → `activeSkillId: UNTAGGED_SKILL_ID`
2. **Line 111**: Change `storeState.activeSkillId === id ? null : ...` → `storeState.activeSkillId === id ? UNTAGGED_SKILL_ID : ...`

## Component structure (target)

```
Skills.tsx
└── AppSection title="Skills" controls={<AppFormModal triggerIcon="add" ...>}
    └── ListBox selectionMode="single" disallowEmptySelection
        ├── ListBox.Item id={UNTAGGED_SKILL_ID}   ← pinned, no edit/delete
        │   └── Label + Description (untagged active count)
        └── {skills.map(skill =>
              ListBox.Item id={skill.id}
              └── Label + Description (skill active count)
              └── AppFormModal triggerIcon="edit" + Trash2 button
            )}
```

## Testing checklist

After implementation, verify manually:

1. App loads → "Untagged" is selected, Snippets panel shows untagged snippets
2. Click a named skill → it becomes active, Snippets panel updates
3. Click the already-active skill → nothing changes
4. Switch agents → active counts in Skills panel update
5. Add skill via modal → new skill appears in alphabetical order
6. Edit skill via modal → name updates in place
7. Delete skill → removed from list; if it was active, Untagged becomes active

Run tests:

```bash
npx vitest run src/components/tests/Skills.test.tsx
npx vitest run src/store/tests/useSkills.test.ts
```
