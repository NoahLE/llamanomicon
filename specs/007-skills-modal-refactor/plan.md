# Implementation Plan: Skills Section Modal Refactor

**Branch**: `007-skills-modal-refactor` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-skills-modal-refactor/spec.md`

## Summary

Replace the three-file Skills component hierarchy (`SkillsList`, `SkillsListItem`, `SkillsListItemEdit`) with a single `Skills.tsx` file that mirrors the `Agent.tsx` pattern: `AppSection` wrapper, `HeroUI Listbox` with single-selection, `AppFormModal` for add/edit, and store-wired active snippet counts per item. Also fix `activeSkillId` initialization to default to `UNTAGGED_SKILL_ID` (not `null`) and fix cascade delete to revert to `UNTAGGED_SKILL_ID` instead of `null`.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, `noUncheckedIndexedAccess: true`)  
**Primary Dependencies**: React 19, Zustand 5, HeroUI (Tailwind v4), Lucide React  
**Storage**: Zustand `persist` + localStorage; only `baseline` + `outputSettings` persisted  
**Testing**: Vitest 4 + React Testing Library; tests in `tests/` subdirectories  
**Target Platform**: Browser (offline-first PWA, desktop-primary)  
**Project Type**: Web application (local-first PWA)  
**Performance Goals**: 60 fps; all operations touch only local state  
**Constraints**: No network calls, no design CSS additions in this feature  
**Scale/Scope**: Single Skills panel; ~5 store lines changed, ~1 new component file, 3 files deleted

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                | Check                                                                                                  | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| I. Code Quality          | TypeScript strict, no `any`, single responsibility per unit, active dead-code removal + simplification | ✅     |
| II. UX Consistency       | Dark-first, uniform interaction patterns, no new motion without precedent                              | ✅     |
| III. Performance         | Offline capable, 60 fps, async IndexedDB, bundle impact reviewed                                       | ✅     |
| IV. Living Documentation | README.md, CLAUDE.md, and docs/ will be updated in the same PR                                         | ✅     |
| V. Simplicity & DRY      | No speculative abstractions; rule of three for any new shared logic                                    | ✅     |
| VI. Testing Discipline   | tests/ subdir per source dir, AAA pattern, native-mechanism setup, isolated tests                      | ✅     |
| Tech Standards           | Uses HeroUI (not custom primitives), dnd-kit, Zustand slices, Vitest + RTL                             | ✅     |
| V1 Scope Gate            | No node graph, no GSAP, no neoskeumorphic design in this feature                                       | ✅     |

**Justification notes:**

- **I**: Three old component files are deleted entirely (no dead code retained). The new `Skills.tsx` follows the same single-responsibility pattern as `Agent.tsx`.
- **II**: No new motion patterns. `AppSection`, `AppFormModal`, and `HeroUI Listbox` are already used in `Agent.tsx`.
- **III**: This feature only modifies component rendering and in-memory Zustand state — no IndexedDB, no network, no bundle additions.
- **IV**: `CLAUDE.md` and `docs/` updates are included in the task list.
- **V**: `skillFormFields` already exists in `src/lib/formFields.ts`. `AppSection`, `AppFormModal`, and `AppFormFieldGenerator` are pre-existing shared components with 2+ call-sites.
- **VI**: Tests will be in `src/components/tests/Skills.test.tsx` and `src/store/tests/useSkills.test.ts`.
- **Tech**: HeroUI `ListBox` is the chosen primitive (already used in Agent.tsx). No new dependencies.
- **V1**: No neoskeumorphic CSS. No GSAP. No node graph.

## Project Structure

### Documentation (this feature)

```text
specs/007-skills-modal-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Skills.tsx                        # NEW — replaces SkillsList + SkillsListItem + SkillsListItemEdit
│   ├── SkillsList.tsx                    # DELETE
│   ├── SkillsListItem.tsx                # DELETE
│   ├── SkillsListItemEdit.tsx            # DELETE
│   └── tests/
│       ├── Skills.test.tsx               # NEW — component integration tests
│       └── SkillsList.test.tsx           # DELETE (replaced by Skills.test.tsx)
│       └── SkillsListItem.test.tsx       # DELETE
├── store/
│   ├── useSkills.ts                      # MODIFY — default activeSkillId → UNTAGGED_SKILL_ID; cascade delete fix
│   └── tests/
│       └── useSkills.test.ts             # MODIFY — add/update tests for new defaults
└── lib/
    └── formFields.ts                     # UNCHANGED — skillFormFields already defined
```

**AppLayout wiring**: The existing app layout renders `<SkillsList />`. After this refactor, that import is replaced with `<Skills />`. The exact location is determined during task execution.

**Structure Decision**: Single web application layout. The feature is a surgical replacement of three component files with one, plus a two-line store fix. No backend, no new packages.

## Complexity Tracking

_No Constitution Check violations. No new abstractions. No new dependencies._
