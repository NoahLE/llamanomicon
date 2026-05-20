# Implementation Plan: Tour Raw Output Step and Copy Cleanup

**Branch**: `017-tour-raw-output` | **Date**: 2026-05-10 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/017-tour-raw-output/spec.md`

## Summary

Add a dedicated Raw Output tour step (9 steps total, up from 8), update the existing Output Structure step copy to scope it to the accordion panel, and strip all em-dashes from every tour step. Requires a `tourTarget` prop on `AppSection` to decouple tour targeting from visual variant and fix a latent DOM collision.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict, `noUncheckedIndexedAccess: true`)  
**Primary Dependencies**: React 19, Vite 7, intro.js v8, HeroUI v3, Tailwind CSS v4  
**Storage**: N/A (no state or persistence changes)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: PWA, browser  
**Project Type**: web-app (PWA)  
**Performance Goals**: 60 fps — no new async work introduced  
**Constraints**: Offline-capable; no new dependencies  
**Scale/Scope**: Single-user, local state only; 3 files changed

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                | Check                                                                                                                               | Status |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality          | TypeScript strict, no `any`; only additive changes; dead-code check: RawOutput's `variant="output"` collision resolved              | [x]    |
| II. UX Consistency       | No new motion or layout patterns; tour content only                                                                                 | [x]    |
| III. Performance         | No new dependencies; no async work; zero bundle impact                                                                              | [x]    |
| IV. Living Documentation | CLAUDE.md "Recent Changes" updated in the same commit                                                                               | [x]    |
| V. Simplicity & DRY      | `tourTarget` prop is minimal; no speculative generality; rule-of-three met (RawOutput is the second caller — AppSection itself is the shared component) | [x]    |
| VI. Testing Discipline   | No store logic changed; no new component behavior; manual verification via quickstart.md is sufficient; no new unit tests required  | [x]    |
| Tech Standards           | HeroUI, Zustand/Immer unchanged; `@/` alias used; no new deps                                                                      | [x]    |
| V1 Scope Gate            | No node graph, no GSAP                                                                                                              | [x]    |

## Project Structure

### Documentation (this feature)

```text
specs/017-tour-raw-output/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files touched)

```text
src/
├── components/
│   ├── AppSection.tsx       # Add tourTarget?: string prop
│   └── RawOutput.tsx        # Pass tourTarget="raw-output" to AppSection
└── data/
    └── tour.ts              # Update step copy + add Raw Output step
```

## Phase 0: Research

See [research.md](research.md). No NEEDS CLARIFICATION items remain.

**Key decisions:**
- `AppSection` gets `tourTarget?: string` prop; `data-tour-target = tourTarget ?? variant`
- Em-dashes replaced with commas in two existing steps
- Output Structure step title updated; copy narrowed to accordion view
- New Raw Output step placed at index 5, targeted by `[data-tour-target="raw-output"]`

## Phase 1: Design & Contracts

See [data-model.md](data-model.md) for the updated tour step sequence and AppSection prop extension.

No external interface contracts — all changes are internal UI data.

## Implementation Sequence

1. **`AppSection.tsx`** — Add `tourTarget?: string` to `AppSectionProps`; update `Card.Root` to use `data-tour-target={tourTarget ?? variant}`.
2. **`RawOutput.tsx`** — Pass `tourTarget="raw-output"` to `AppSection`. Also remove the conditional `variant` (it was `variant={xmlOutput ? "output" : undefined}`) — the visual output styling should always apply since the Raw Output section is always showing the output area regardless of content state.
3. **`tour.ts`** — Replace em-dashes in steps 2 and 5; update step 5 title to "Output Structure" and narrow its copy; insert new Raw Output step at index 5.
4. **`CLAUDE.md`** — Add entry to Recent Changes.
