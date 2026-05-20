# Implementation Plan: Split Output Window

**Branch**: `015-split-output-window` | **Date**: 2026-05-07 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/015-split-output-window/spec.md`

## Summary

Split the Output panel into two vertically-stacked sub-sections: **Output Structure** (top — existing skill-group accordion) and **Raw Output** (bottom — compiled text with a format toggle and single copy button). Remove the two copy buttons from the panel header. No store or data-model changes; one component file changes.

## Technical Context

**Language/Version**: TypeScript 6.0, strict mode, `noUncheckedIndexedAccess: true`  
**Primary Dependencies**: React 19, Vite 7, HeroUI v3, Tailwind CSS v4, Zustand 5 + Immer 11  
**Storage**: localStorage via `persist` middleware — no changes  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Browser PWA (offline-capable)  
**Project Type**: web-app / PWA  
**Performance Goals**: 60 fps; toggle interaction is synchronous local state only  
**Constraints**: Offline-capable; no new dependencies; no store changes  
**Scale/Scope**: Single component refactor (`OutputWindow.tsx`); ~2 new JSX sections

## Constitution Check

| Principle                | Check                                                                                                                               | Status |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality          | TypeScript strict, no `any`, self-describing names; dead code removed (unused `copyXML`/`copiedXML` hook + both header buttons)     | [x]    |
| II. UX Consistency       | Dark-first; `ButtonGroup` + `Button` pattern already established in `Agents.tsx`; toggle uses existing `variant` props; no new motion | [x]    |
| III. Performance         | Offline capable unchanged; toggle is `useState` — zero async; no new dependency added to bundle                                     | [x]    |
| IV. Living Documentation | `CLAUDE.md` Recent Changes section updated in same PR                                                                               | [x]    |
| V. Simplicity & DRY      | No new component extracted (one call-site); reuses existing selectors; `useState` not promoted to store                             | [x]    |
| VI. Testing Discipline   | New tests in `src/components/tests/OutputWindow.test.tsx`; AAA pattern; isolated per-test store state                               | [x]    |
| Tech Standards           | HeroUI `ButtonGroup` + `Button`; `@/` alias; Zustand selectors unchanged; Vitest + RTL for tests                                    | [x]    |
| V1 Scope Gate            | No node graph, no GSAP; neoskeumorphic `<pre>` inset shadow styling is permitted                                                    | [x]    |

All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/015-split-output-window/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (affected files only)

```text
src/
└── components/
    ├── OutputWindow.tsx          ← primary change
    └── tests/
        └── OutputWindow.test.tsx ← new test file
```

No other source files change. `SkillGroupAccordion.tsx`, `useSettings.ts`, `compiler.ts`, and all store slices are untouched.

## Phase 0: Research

**Status**: Complete — see [research.md](research.md)

Key decisions:
- **Toggle**: `ButtonGroup` with two `Button` elements (`variant="primary"` for active, `variant="secondary"` for inactive) — matches existing `Agents.tsx` pattern.
- **Format state**: `useState<"xml" | "text">("xml")` local to `OutputWindow`. Not persisted.
- **Text display**: `<pre>` element with `overflow-auto` and inset shadow.
- **Selectors**: Reuse `selectCompiledOutput` (plain text) and `selectCompiledOutputXML` from `src/store/useSettings.ts`.
- **Component extraction**: Keep inline — only one call-site, fails rule-of-three for extraction.
- **Cleanup**: Remove `copyXML` / `copiedXML` hook instance and both header copy buttons.

## Phase 1: Design & Contracts

**Status**: Complete — see [data-model.md](data-model.md), [quickstart.md](quickstart.md)

No external interface contracts (pure UI reorganization).

### OutputWindow.tsx — Refactored Structure

```
OutputWindow
├── AppSection (variant="output" when output exists)
│   ├── [header — title only, NO copy buttons]
│   └── [content area — flex column, h-full]
│       ├── Output Structure section (flex-1, overflow-auto)
│       │   ├── empty state (when skillGroups.length === 0)
│       │   └── Accordion (allowsMultipleExpanded, variant="surface")
│       │       └── SkillGroupAccordion × n
│       └── Raw Output section (shrink-0, border-t, padding)
│           ├── sub-header row
│           │   ├── label "Raw Output"
│           │   └── ButtonGroup
│           │       ├── Button "XML"  (variant="primary"|"secondary")
│           │       └── Button "Text" (variant="primary"|"secondary")
│           ├── <pre> (overflow-auto, max-h, inset shadow)
│           │   └── {activeOutput || empty placeholder}
│           └── copy Button (isDisabled={!activeOutput}, copied feedback)
```

### State in OutputWindow.tsx

```typescript
// Selectors (existing, unchanged)
const skillGroups = useAppStore(selectSkillGroupsForOutput);
const activeAgent  = useAppStore(selectActiveAgent);
const xmlOutput    = useAppStore(selectCompiledOutputXML);
const textOutput   = useAppStore(selectCompiledOutput);

// New local state
const [outputFormat, setOutputFormat] = useState<"xml" | "text">("xml");
const activeOutput = outputFormat === "xml" ? xmlOutput : textOutput;

// Single copy hook (remove the XML-specific one)
const { copy, copied } = useCopyToClipboard();
```

### Key Styling Notes

- Output Structure section: `className="flex-1 overflow-auto"` — takes remaining height
- Raw Output section: `className="shrink-0 border-t border-border p-3 flex flex-col gap-2"` — fixed at bottom
- `<pre>`: `className="text-sm overflow-auto max-h-40 rounded p-2 bg-black/20 shadow-inner whitespace-pre-wrap break-words"`
- Use `--panel-output` tokens for accent color consistency (matching existing header glow)
- Active format button: `variant="primary"` or whatever matches existing primary state in other panels

## Verification

Follow [quickstart.md](quickstart.md) for end-to-end manual verification.

**Automated**:
```bash
npx vitest run src/components/tests/OutputWindow.test.tsx
make build    # type-check + production build
```

**Test scenarios to cover**:
1. Default format is XML; displayed text matches `selectCompiledOutputXML`
2. Clicking "Text" toggle switches displayed content to `selectCompiledOutput`
3. Copy button invokes clipboard with correct content for each format
4. Copy button is disabled when no active snippets
5. No copy buttons render in the panel header
6. Empty state shows correctly when no skill groups
