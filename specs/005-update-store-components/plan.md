# Implementation Plan: Sync UI Components with New Data Structure & Add Automated Tests

**Branch**: `005-update-store-components` | **Date**: 2026-04-19 | **Spec**: [specs/005-update-store-components/spec.md](spec.md)
**Input**: Feature specification from `/specs/005-update-store-components/spec.md`

## Summary

Update React UI components to match the new Map/Set-based Zustand store structure (following the `004-entity-restructure`). Rename "Flow" to "Agent" and "Group" to "Skill" in all components. Implement React Testing Library tests for these components to ensure reliability during and after the transition. The implementation will proceed incrementally: Snippets -> Skills -> Agents -> Layout/Integration.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)  
**Primary Dependencies**: React 19, Zustand 5, HeroUI, dnd-kit, Vitest, React Testing Library  
**Storage**: Zustand `persist` middleware (LocalStorage)  
**Testing**: Vitest + React Testing Library (co-located tests)  
**Target Platform**: Modern Browsers (Offline-first PWA)
**Project Type**: Web application (React/Vite)  
**Performance Goals**: 60 fps; filtering/list updates <100ms  
**Constraints**: Dark-first theme, no GSAP/Neoskeumorphic design (V1 scope gate), offline-capable  
**Scale/Scope**: ~10 UI components to refactor, ~10 new test files to create

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verify compliance with each principle before proceeding:

| Principle                | Check                                                                                                  | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| I. Code Quality          | TypeScript strict, no `any`, single responsibility per unit, active dead-code removal + simplification | [x]    |
| II. UX Consistency       | Dark-first, uniform interaction patterns, no new motion without precedent                              | [x]    |
| III. Performance         | Offline capable, 60 fps, async IndexedDB, bundle impact reviewed                                       | [x]    |
| IV. Living Documentation | README.md, CLAUDE.md, and docs/ will be updated in the same PR                                         | [x]    |
| V. Simplicity & DRY      | No speculative abstractions; rule of three for any new shared logic                                    | [x]    |
| VI. Testing Discipline   | Co-located \*.test.ts files, AAA pattern, native-mechanism setup, isolated tests                       | [x]    |
| Tech Standards           | Uses HeroUI (not custom primitives), dnd-kit, Zustand slices, Dexie, Vitest + RTL                      | [x]    |
| V1 Scope Gate            | No node graph, no GSAP, no neoskeumorphic design in this feature                                       | [x]    |

## Project Structure

### Documentation (this feature)

```text
specs/005-update-store-components/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AgentList.tsx         (renamed from FlowList.tsx)
│   ├── AgentList.test.tsx    (new)
│   ├── AgentListItem.tsx     (renamed from FlowListItem.tsx)
│   ├── AgentListItem.test.tsx (new)
│   ├── SkillsList.tsx        (renamed from GroupsList.tsx)
│   ├── SkillsList.test.tsx   (new)
│   ├── SkillsListItem.tsx    (renamed from GroupsListItem.tsx)
│   ├── SkillsListItem.test.tsx (new)
│   ├── SnippetsPanel.tsx
│   ├── SnippetsPanel.test.tsx (new)
│   └── ...
├── store/                    (already updated in 004, but used here)
│   ├── useAgents.ts
│   ├── useSkills.ts
│   └── useSnippets.ts
└── types/
    ├── Agent.ts
    ├── Skill.ts
    └── Snippet.ts
```

**Structure Decision**: Single project (DEFAULT). Following existing component structure but adding co-located tests and renaming entities.

## Complexity Tracking

_No violations currently identified._
