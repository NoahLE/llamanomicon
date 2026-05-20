<!--
SYNC IMPACT REPORT
==================
Version change: 1.4.0 → 1.5.0
Modified principles:
  - II. User Experience Consistency — promoted neoskeumorphic/skeumorphic styling to active
    V1 design language. Removed the V1/V2 deferral rule. GSAP animations remain deferred to v2.
  - Development Workflow — removed "neoskeumorphic design" from the V1 Scope Gate; node graph
    and GSAP remain explicitly deferred. Neoskeumorphic/skeumorphic styling is now permitted
    and encouraged in v1.
Added sections: None
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ V1 Scope Gate row updated
  - .specify/templates/spec-template.md ✅ No change needed
  - .specify/templates/tasks-template.md ✅ No change needed
Updated artifacts:
  - CLAUDE.md and docs/styling.md already reflect neoskeumorphic as the
    active design direction — no further updates needed.
Deferred items: None

Previous report (1.3.0 → 1.4.0):
  - I. Code Quality — added descriptive variable naming rule: names MUST be self-describing;
    single-letter or abbreviated identifiers (e.g., `s` for store) are forbidden.
  - IV. Living Documentation — added source-of-truth hierarchy: codebase is authoritative,
    then docs/, then specs (which may lag). Added explicit callout that speckit artifacts
    are not automatically updated when code changes outside speckit.
  - Technology Standards — corrected stack to match actual package.json and CLAUDE.md:
    TypeScript 6.0 (was 5), localStorage/persist (was Dexie.js/IndexedDB), Immer 11 added,
    dnd-kit removed (no longer in project).
  - .specify/templates/plan-template.md ✅ Tech Standards check row updated

Previous report (1.2.2 → 1.3.0):
  - II. User Experience Consistency — removed the V1/V2 deferral of
    neoskeumorphic design (superseded by 1.5.0 which re-applies it correctly).
  - Development Workflow — removed "no neoskeumorphic design" from the V1 Scope Gate.
  - .specify/templates/plan-template.md ✅ V1 Scope Gate row updated

Previous report (1.2.1 → 1.2.2):
  - VI. Testing Discipline — replaced flat co-location rule with nested
    tests/ subdirectory convention.
-->

# Llamanomicon Constitution

## Core Principles

### I. Code Quality

All code MUST pass TypeScript strict-mode type-checking, ESLint, and Prettier formatting
before being considered complete. Use of `any` is forbidden without an inline suppression
comment that names the specific, unavoidable reason. Dead code MUST be removed — commented-out
blocks and unused exports are not permitted. Every component, hook, and utility MUST have a
single, clear responsibility.

**Naming**: All variables, parameters, and identifiers MUST be self-describing. Single-letter
or abbreviated names (e.g., `s` for a store, `a` for an agent, `snip` for a snippet) are
forbidden. Names MUST communicate what the value represents at the call-site without requiring
the reader to trace the declaration. Examples: use `store` or `agentStore`, not `s`; use
`snippet`, not `snip`; use `skillId`, not `id` when the type is ambiguous.

**Active cleanup**: When making any change, the developer MUST check the affected area for
dead or unused code (imports, variables, functions, types, files) and remove it in the same
commit. The developer MUST also look for opportunities to simplify surrounding code that the
change reveals — collapsible branches, redundant wrappers, over-parameterized functions, or
abstractions that no longer earn their complexity. This is a natural step as the project
evolves, not a separate cleanup task.

**Rationale**: Strict hygiene across the type system, linter, and test suite prevents
compounding technical debt as the feature set grows. Descriptive names make code reviewable
without context-switching to find declarations. Active cleanup during changes keeps the
codebase lean without requiring dedicated refactoring sprints.

### II. User Experience Consistency

All UI MUST follow the dark-first design language established in `index.css`. Interaction
patterns (hover states, focus rings, transitions, copy feedback) MUST be uniform across all
five panels. No panel MAY introduce a layout or motion pattern not already present elsewhere
without a documented design decision. Accessible color contrast ratios MUST be maintained
for all text elements.

**Design direction**: Neoskeumorphic/skeumorphic tactile styling (inset shadows, depth
effects, raised surfaces, light-source highlights) is the active V1 design language —
it MAY be applied to any panel or component. All color values MUST reference design tokens;
no hardcoded color values are permitted. CSS transitions only for depth effects.
**V2 deferred**: GSAP animations (entrance, feedback, stagger) remain deferred to v2.

**Rationale**: Llamanomicon is a single-session tool — users build muscle memory fast.
Inconsistency destroys trust in the interface and slows the core copy-to-clipboard loop.
Separating the design upgrade into v2 keeps v1 scope tight and shippable.

### III. Performance First

The app MUST remain fully functional offline after first load (PWA service worker). UI MUST
render at a steady 60 fps; no interaction that touches only local state MAY trigger a
perceptible delay. Bundle size MUST be audited on every dependency addition — only packages
that are tree-shakeable or genuinely necessary are permitted.

**Rationale**: The offline-first promise is the product's core value proposition. Sluggish
or network-dependent behaviour invalidates the entire design.

### IV. Living Documentation

`README.md`, `CLAUDE.md`, and every file in `docs/` MUST be updated in the same
commit or PR as any code change they document. Stale documentation is treated as
a bug, not a backlog item.

**Source-of-truth hierarchy**: When documentation conflicts with code, the codebase is
authoritative. Resolution order:

1. **Codebase** — `src/`, `package.json`, config files — always current.
2. **`docs/`** — kept in sync by the Living Documentation rule above.
3. **Speckit artifacts** (`specs/*/spec.md`, `plan.md`, `tasks.md`) — reflect intent at
   the time they were authored. Not all code changes go through speckit, so these files
   may lag behind the actual implementation. They MUST NOT be treated as ground truth for
   current behaviour; always verify against the code.

**Dual-purpose context**: These files serve two equally important audiences —
human developers orienting in the codebase, and LLM coding assistants picking up
session context. Both need the same things: accuracy, brevity, and navigability.
Write for scannability, not completeness. Every sentence must earn its place.

**`CLAUDE.md`** is the root context file loaded at the start of every AI session.
It MUST be accurate and complete at all times and is the authoritative source of
truth for project-wide conventions. Any change that affects the tech stack,
architecture, data model, commands, or design direction MUST be reflected in
`CLAUDE.md` before or in the same commit as the implementation.

**`docs/` files** are detail pages. Each file MUST have a single, clearly named
focus (e.g., `models.md` covers the data model only). Cross-referencing is
encouraged; duplication is not permitted. When a doc file is added, removed, or
renamed, `README.md`'s documentation table MUST be updated in the same commit.

**`README.md` as Documentation Index**: `README.md` MUST serve as the top-level
index for the `docs/` folder. It MUST contain, in order:

1. **Project summary** — one concise paragraph describing what Llamanomicon is and why it exists.
2. **Documentation file table** — a Markdown table listing every file in `docs/` with its
   filename and a one-sentence description of its purpose.
3. **Getting started guide** — step-by-step instructions covering installation,
   running the dev server, and the basic usage loop (select Agent → toggle Snippets → copy output).

**Rationale**: AI-assisted development sessions pick up context exclusively from docs.
Docs that lag behind the code produce incorrect future suggestions and compound confusion
across sessions. The dual-audience constraint — human clarity and LLM context quality —
is stricter than either alone: it rules out both exhaustive reference dumps and vague prose.
The source-of-truth hierarchy prevents stale spec artifacts from misleading either audience.

### V. Simplicity & DRY

Every abstraction MUST be justified by at least two concrete call-sites (rule of three). Shared
logic MUST be extracted exactly once — not per-panel, not per-feature. YAGNI (You Aren't
Gonna Need It) applies: no speculative generality, no configuration options for unpredicted
use cases, no wrapper layers that add no semantic value. When two approaches exist, the simpler
MUST be chosen unless a documented performance or correctness requirement demands otherwise.

**Rationale**: Llamanomicon's V1 scope is tightly bounded. Every unnecessary layer of
indirection increases onboarding cost and bug surface for zero user benefit.

### VI. Testing Discipline

**Nesting**: Test files MUST live in a `tests/` subdirectory within the same parent directory
as the source file they test. The test file name MUST match the source file name exactly.
For example: `src/components/Foo.tsx` → `src/components/tests/Foo.test.tsx`, and
`src/store/useSnippets.ts` → `src/store/tests/useSnippets.test.ts`.
No other test directory structure (`__tests__/`, top-level `tests/`, etc.) is permitted.

**Arrange, Act, Assert**: Every test MUST follow the AAA pattern:

1. **Arrange** — set up the preconditions and initial state.
2. **Act** — perform the action under test.
3. **Assert** — verify the expected outcome.

**Native mechanisms first**: Tests MUST prefer calling real store actions, component
interactions, and application APIs to build state rather than programmatically
constructing state objects. For example, to test deleting a snippet that is active
in an agent, the test MUST call the store's create-snippet, create-agent, and
activate-snippet actions to reach the target state, then call delete-snippet and
assert the cascade. Direct object construction is permitted only when no application
API exists for the setup step.

**Isolation**: Every test MUST be runnable individually and in any order. Tests
MUST NOT depend on shared mutable state, execution order, or side effects from
other tests. Each test MUST set up its own state and tear down after itself.

**Tools**: Vitest for all tests. React Testing Library for component integration
tests. No other test runners or DOM utilities are permitted.

**Rationale**: Nesting tests in a `tests/` subdirectory keeps each source directory
self-contained — the test suite for any module is always one level down, predictable
to locate, and never clutters the source listing. AAA makes tests scannable and
debuggable. Native-mechanism setup catches real integration bugs that hand-constructed
state would miss. Isolation ensures the suite remains trustworthy as it grows.

## Technology Standards

- **Language/Runtime**: TypeScript 6.0 (strict mode) — no implicit `any`, `noUncheckedIndexedAccess` on
- **Framework**: React 19 + Vite 7; Tailwind CSS v4 via `@tailwindcss/vite` (no config file)
- **State**: Zustand 5 slices + Immer 11 middleware; all `set()` callbacks MUST use
  draft-style direct mutation — no object spreads; state MUST be serializable to/from JSON
- **Persistence**: localStorage via Zustand `persist` middleware (key: `llamanomicon-v2`);
  custom Map/Set serialization in `src/lib/serialization.ts`; no server calls, no remote endpoints
- **UI Primitives**: HeroUI v3 (Tailwind v4 compatible); prefer over custom components for covered use cases
- **Testing**: Vitest + React Testing Library; test files in `tests/` subdirectory per source directory
  (e.g., `src/components/tests/*.test.tsx`, `src/store/tests/*.test.ts`)
- **Linting / Formatting**: ESLint (`typescript-eslint` type-checked) + `eslint-plugin-react-x` +
  `eslint-plugin-react-dom`; Prettier with default config
- **PWA**: `vite-plugin-pwa`; service worker strategy MUST cache all app assets for offline use
- **Path alias**: `@/` MUST resolve to `src/` in both `vite.config.ts` and `tsconfig.json`.
  All imports from within `src/` MUST use the `@/` alias rather than relative paths —
  write `@/store/useSnippets` not `../store/useSnippets` or `./useSnippets`. Relative
  import syntax (`./`, `../`) is forbidden for any file that lives under `src/`.

## Development Workflow

- **Branching**: Feature branches off `main`; branch name format `###-short-description`
- **Commits**: Small, atomic, passing-lint commits; commit messages describe _why_ not _what_
- **Documentation-first**: Update relevant `CLAUDE.md` / `docs/` before (or in the same commit as)
  the implementation change; speckit artifacts (spec.md, plan.md, tasks.md) are supplementary
  and MAY be updated separately
- **Source-of-truth order**: When in doubt, trust (1) the codebase, (2) `docs/`, (3) speckit
  artifacts. Speckit artifacts are snapshots of intent, not live records — verify against code
  before acting on them
- **Dependency additions**: Justify in a code comment or spec note; verify tree-shakeability
  and bundle impact before merging
- **Import / Export**: Full JSON state only; replace-not-merge semantics MUST be preserved;
  no partial-import paths
- **V1 scope gate**: Node graph visualization and GSAP animations are explicitly deferred
  to v2; do not add any of these in v1 work. Neoskeumorphic/skeumorphic styling is permitted
  and encouraged in v1.

## Governance

This constitution supersedes all informal conventions. Any amendment MUST:

1. Update this file with a version bump following semantic versioning (MAJOR for principle
   removal/redefinition, MINOR for new principle or section, PATCH for clarifications).
2. Propagate changes to affected templates in `.specify/templates/`.
3. Update `CLAUDE.md` if project-wide conventions are affected.
4. Include a Sync Impact Report (HTML comment at top of this file).

All implementation plans MUST include a Constitution Check section that gates Phase 0 research.
Complexity violations (e.g., adding a fourth top-level concern not covered by these principles)
MUST be documented in the plan's Complexity Tracking table with explicit justification.

---

**Version**: 1.5.0 | **Ratified**: 2026-03-07 | **Last Amended**: 2026-04-30
