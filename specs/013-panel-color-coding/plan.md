# Implementation Plan: Panel Color Coding

**Branch**: `013-panel-color-coding` | **Date**: 2026-05-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-panel-color-coding/spec.md`

## Summary

Add a unique futuristic color identity to each app panel — electric cyan for Agents, amber-gold for Skills, violet for Snippets, and conditional signal-green for Output (active only when compiled output is non-empty). Color identity is expressed as CSS custom property token sets (border color, box-shadow glow, title color, title text-shadow) routed through a `variant` prop on the shared `AppSection` container. All values are adjustable from `src/style/theme.css` without touching component logic.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode), `noUncheckedIndexedAccess: true`
**Primary Dependencies**: React 19, Tailwind CSS v4, HeroUI v3, Zustand 5 + Immer 11
**Storage**: N/A — no persistence changes; design tokens only
**Testing**: Vitest + React Testing Library
**Target Platform**: Web PWA — dark-first; light theme supported via `[data-theme="light"]`
**Project Type**: Web application (PWA)
**Performance Goals**: Color state change within one render frame (FR-008, SC-002); no JS computation for static panel colors
**Constraints**: No new npm dependencies; CSS-only for static glows; inline style override pattern established by `AppHeader.tsx`
**Scale/Scope**: Four panel components, one shared container component, one CSS file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle              | Check                                                                                                                               | Status |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Code Quality        | TypeScript strict: `PanelVariant` union + typed lookup table, no `any`. Naming: `variantTokens`, `cardStyle`, `titleStyle` — all self-describing. Dead code: none introduced; `className` unused prop removed in cleanup. | ✅ Pass |
| II. UX Consistency     | Dark-first with `[data-theme="light"]` overrides. All color values reference CSS tokens — no hardcoded hex. Neoskeumorphic depth treatment consistent with nav bar precedent. Title contrast verified at WCAG AA (≥4.5:1) for all three colored titles on dark surface. | ✅ Pass |
| III. Performance       | Pure CSS for static panel glows — zero JS overhead. Output glow derives from `selectCompiledOutput` already subscribed in `OutputWindow`; no extra selector or effect. Bundle unchanged. | ✅ Pass |
| IV. Living Documentation | `CLAUDE.md` Recent Changes section documents the `--panel-*` token system. `docs/styling.md` must be updated to document panel tokens alongside existing nav tokens. | ⚠️ Partial — `docs/styling.md` update pending |
| V. Simplicity & DRY    | Single shared `AppSection` container is the only injection point. Token lookup table is one object. Output glow is a one-line conditional at the call site. Rule of three satisfied: four panels use the variant system. | ✅ Pass |
| VI. Testing Discipline | Static CSS glows are verified visually. The conditional Output glow behavior is a candidate for a component test in `src/components/tests/OutputWindow.test.tsx`. | ⚠️ Partial — component test for Output glow pending |
| Tech Standards         | HeroUI `Card.Root` used as panel container. Inline `style` prop for shadow/border override — established pattern from `AppHeader.tsx`. `@/` alias used for all imports. No new dependencies. | ✅ Pass |
| V1 Scope Gate          | No GSAP, no node graph. Neoskeumorphic depth styling — explicitly permitted in v1. | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/013-panel-color-coding/
├── plan.md              # This file
├── research.md          # Color decisions, token strategy, contrast verification
├── data-model.md        # Panel color token schema + shadow layer anatomy
├── quickstart.md        # How to adjust colors, add variants, verify Output glow
├── contracts/
│   └── app-section-variant.md  # AppSection variant prop UI contract
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
src/
├── style/
│   └── theme.css            # --panel-* CSS token definitions (dark + light)
└── components/
    ├── AppSection.tsx         # PanelVariant type, variantTokens lookup, variant prop
    ├── Agents.tsx             # variant="agents"
    ├── Skills.tsx             # variant="skills"
    ├── Snippets.tsx           # variant="snippets"
    ├── OutputWindow.tsx       # variant={output ? "output" : undefined}
    └── tests/
        └── OutputWindow.test.tsx  # Conditional glow component test (pending)
```
