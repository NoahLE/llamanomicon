# Implementation Plan: Skill Active Snippet Count

**Branch**: `001-skill-active-count` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-skill-active-count/spec.md`

## Summary

Display a live "(active/total)" snippet count on every skill row in the Skills List panel (including the "Untagged" virtual row). Counts reflect the currently selected agent's active set, update immediately on any state change, and are computed as pure derived values from existing store state — no new data model fields required.

Selectors are co-located in their owning slice files per the store refactor that removed `src/store/selectors.ts`: `selectSnippetCountForSkill` → `useSkills.ts`, `selectUntaggedSnippetCount` → `useSnippets.ts`.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, `noUncheckedIndexedAccess` on)  
**Primary Dependencies**: React 19, Zustand 5, Tailwind CSS v4, HeroUI  
**Storage**: localStorage via Zustand `persist` middleware (no server, no IndexedDB for this feature)  
**Testing**: Vitest 4 + React Testing Library  
**Target Platform**: Browser PWA (offline-capable, desktop-first)  
**Project Type**: Single-page web application  
**Performance Goals**: 60 fps; count display updates within one render cycle  
**Constraints**: Offline-capable; no new network calls; no new dependencies; bundle impact: zero (pure logic addition)  
**Scale/Scope**: Small — 2 new selector functions (in existing slice files), 2 modified components, new/updated tests

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle            | Check                                                                                       | Status |
| -------------------- | ------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality      | Two pure selector functions, no `any`, no dead code introduced; existing components extended minimally | [x] |
| II. UX Consistency   | Count is plain text only, follows existing muted-text pattern; no new motion or layout pattern | [x] |
| III. Performance     | O(n) pure derivation over existing Maps; no new subscriptions or re-renders beyond what's already in SkillsListItem | [x] |
| IV. Living Docs      | CLAUDE.md Key Selectors section updated in same PR; quickstart.md updated               | [x] |
| V. Simplicity & DRY  | One selector per entity type (named skill / untagged); inline usage at call site — no wrapper layer | [x] |
| VI. Testing Discipline | Tests appended to `src/store/tests/useSkills.test.ts` and `src/store/tests/useSnippets.test.ts`; new `src/components/tests/SkillsListItem.test.tsx`; AAA pattern; native store actions for setup | [x] |
| Tech Standards       | No new dependencies; uses Zustand, Vitest, RTL, HeroUI text patterns; `selectors.ts` not recreated | [x] |
| V1 Scope Gate        | Text display only — no node graph, no GSAP, no neoskeumorphic design                       | [x] |

All gates pass. No violations.

## Project Structure

```text
src/
├── components/
│   ├── SkillsList.tsx              # Modified: add untagged count display
│   ├── SkillsListItem.tsx          # Modified: add count display
│   └── tests/
│       └── SkillsListItem.test.tsx # New: count display unit tests
└── store/
    ├── useSkills.ts                # Modified: add selectSnippetCountForSkill
    ├── useSnippets.ts              # Modified: add selectUntaggedSnippetCount
    └── tests/
        ├── useSkills.test.ts       # Modified: append count selector tests
        └── useSnippets.test.ts     # Modified: append count selector tests
```

**Structure Decision**: Single project, frontend-only change. No new directories needed — all work lands in existing `src/components/` and `src/store/` subtrees following their established `tests/` subdirectory convention. `src/store/selectors.ts` does not exist and must not be recreated.
