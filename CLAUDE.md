# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Llamanomicon** is a local-first, offline PWA for composing LLM prompts from reusable, toggleable text snippets. The core loop: select an Agent → activate Snippets → copy the compiled output. No server, no auth, no cloud dependency.

## Commands

```bash
make install      # pnpm install
make dev          # start dev server with HMR (http://localhost:5173)
make lint         # type-check + ESLint + knip + Prettier auto-fix
make build        # clears output/ then type-check + production build
make preview      # serve production build locally
make commit       # create styled commit messages (commitizen)
make test-e2e     # run Playwright end-to-end tests
make test-e2e-ui  # run Playwright end-to-end tests in UI mode
```

```bash
pn test                                                  # run all tests once
pn run test-watch                                        # Vitest watch mode
pn exec vitest run src/store/tests/useSnippets.test.ts   # run a single test file
pn run format-check                                      # Prettier check (no write)
```

## Architecture

### Data Model

Three independent entity types stored as `Map<id, Entity>`:

- **Snippets** — atomic text fragments with skill tags (`skills: Set<string>`). Independent entities, not children of any group. Shared across all agents — editing a snippet updates everywhere.
- **Skills** — pure tags with only `id` and `name`. Many-to-many relationship with snippets. Displayed alphabetically. "Untagged" is a virtual filter, not a stored skill.
- **Agents** — ordered collections of active snippets. Each has `activeSet: Set<string>` (O(1) membership). Agents reference snippets directly — no relationship to skills.

**Derived index:** `snippetsBySkill: Map<string, Set<string>>` — inverse index from skill ID to snippet IDs. Rebuilt on load, updated on tag mutations, NOT persisted.

**Cascade rules:**

- `deleteSnippet` → removes from `snippetsBySkill` for all its skills; removes from all agents' `activeSet`
- `deleteSkill` → removes from all snippets' `skills` Set; removes from `snippetsBySkill`; clears `activeSkillId` if it was the deleted skill
- `deleteAgent` → self-contained; clears `activeAgentId` if it was the deleted agent

**IDs:** All entities use `crypto.randomUUID()` (string UUIDs). No auto-increment. See `docs/models.md` for canonical type definitions — that file is the source of truth for all interfaces (`Entity`, `Snippet`, `Skill`, `Agent`, `DataState`, `SessionState`, `OutputSettings`, `AppState`).

### State / Persistence

- **Zustand 5 + Immer** — slice-based store with a session/baseline model. All mutations use Immer's draft pattern via `zustand/middleware/immer` — mutate state directly in `set((s) => { s.foo = bar })`, no spreads needed. Slices spread into a single root `create<StoreState>()` with middleware stack `devtools → persist → immer`:
  - `src/store/useAppStore.ts` — root; composes all slices; `persist()` to localStorage; `createSelectors()` factory for `.use` accessors
  - `src/store/useSnippets.ts` — `createSnippetsSlice`: snippet CRUD + tagging (`addSkillToSnippet`, `removeSkillFromSnippet`), cascade deletes; selectors: `selectAllSnippets`, `selectUntaggedSnippets`, `selectSnippetsForSkill`
  - `src/store/useSkills.ts` — `createSkillsSlice`: skill CRUD, cascade deletes (remove from snippets + index + agents); tracks `activeSkillId`; selectors: `selectSortedSkills`, `selectSnippetCountForSkill`, `selectUntaggedSnippetCount`, `UNTAGGED_SKILL_ID`
  - `src/store/useAgents.ts` — `createAgentsSlice`: agent CRUD, `setActiveAgentId`; selectors: `selectActiveAgent`, `selectSortedAgents`, `selectSkillGroupsForOutput` (memoized)
  - `src/store/useAgentSnippets.ts` — `createAgentsSnippetsSlice`: `activateSnippet`, `deactivateSnippet`
  - `src/store/useSettings.ts` — `createSettingsSlice`: `outputSettings`, `updateOutputSettings`; selectors: `selectCompiledOutput`, `selectCompiledOutputXML`
  - `src/store/useDataControls.ts` — `createDataControlsSlice`: `saveSession()`, `discardSession()`, `clearData()`, `importState`, `rebuildIndex`, `seedData`
- **Session model**: The flat maps (`agents`, `snippets`, `skills`) on `StoreState` are the live session state. `baseline: DataState` is the last saved snapshot (persisted). `saveSession()` clones live state → baseline. `discardSession()` clones baseline → live state + rebuilds index. On hydration (`onRehydrateStorage`): baseline loaded → live maps cloned from baseline → `snippetsBySkill` rebuilt.
- **localStorage** via Zustand `persist` middleware (key: `"llamanomicon-v2"`) — only `baseline` and `outputSettings` are persisted. Custom Map/Set serialization in `src/lib/serialization.ts` (replacer/reviver).
- **Selection state**: `activeAgentId: string | null` (drives output compilation) and `activeSkillId: string | null` (filters Snippets Panel; `"__untagged__"` is the virtual ID for untagged snippets).

**Component access pattern:**

```typescript
// Actions / simple state — use .use accessor (auto-shallow equality)
const addSnippet = useAppStore.use.addSnippet();
const activeAgentId = useAppStore.use.activeAgentId();

// Derived/computed state — pass a selector (use useShallow for arrays/objects)
const snippets = useAppStore((state) => selectSnippetsForSkill(state, skillId));
```

**Key selectors** (co-located with their owning slice): `selectActiveAgent` + `selectSortedAgents` + `selectSkillGroupsForOutput` → `useAgents.ts`; `selectSortedSkills` + `selectSnippetCountForSkill` + `selectUntaggedSnippetCount` + `UNTAGGED_SKILL_ID` → `useSkills.ts`; `selectSnippetsForSkill` + `selectUntaggedSnippets` + `selectAllSnippets` → `useSnippets.ts`; `selectCompiledOutput` + `selectCompiledOutputXML` → `useSettings.ts`.

### Library Utilities

`src/lib/storeUtils.ts` — shared store helpers: `UNTAGGED_SKILL_ID` constant, `sortByName<T>()`, `buildSnippetsBySkill(snippets)` (builds the derived index on hydration/reset).

`src/lib/indexUtils.ts` — `addToSetIndex` / `removeFromSetIndex` for incremental `snippetsBySkill` updates.

`src/lib/importExport.ts` — `exportState()`, `importStateFromFile()`, `validateAppState()`.

`src/lib/serialization.ts` — custom JSON `replacer`/`reviver` for Map/Set persistence.

### Output Compilation

`src/lib/compiler.ts` — pure functions, no side effects:

**`buildSkillGroups`** (shared building block): Builds an ordered `SkillGroup[]` from agent + data maps. Order: all skills with ≥1 active snippet, sorted alphabetically → Untagged last. Snippets within each group sorted alphabetically by name.

**`compileOutputBySkillGroup`** (active text path): Calls `buildSkillGroups`, then emits each snippet's text in group order; tracks a `seen` Set so multi-skill snippets appear only once (at first-group position); joins with `"\n"` and trims.

**`compileOutputXML`** (active XML path): Same ordering and deduplication as above, but wraps each skill group in `<tagName>` XML tags (skill name converted to a valid tag slug) with each snippet prefixed by `• `. Groups joined with `"\n\n"`.

### UI Layout

Five panels in a 2-row, 3-column grid where the Output Window spans the full right column. Core panels are implemented; Node Graph is deferred to v2:

| Top-left          | Top-center                      | Right (full height) |
| ----------------- | ------------------------------- | ------------------- |
| Agent List (CRUD) | Node Graph (v2)                 | Output Window       |
| Skills List       | Snippets Panel (toggle/reorder) | ↑                   |

Implemented components: `NavHeader` (app header), `NavSidebar`, `Agents`, `Skills`, `Snippets`, `PromptOutput` (split into `PromptStructure` accordion + `RawOutput` pre with XML/Text toggle), `SkillGroupAccordion`, `SnippetItem`, `DataControls`, `SessionControls`, `AppFormModal`, `ThemeButton`, `WelcomeModal`, `DocsModal`, `AppSection`, `ActionCard`.

## Testing

Tests use Vitest + `@testing-library/react`, co-located as `*.test.ts` / `*.test.tsx` files.

- **Store tests**: use `createTestStore(sliceCreator)` from `src/store/tests/testUtils.ts` — creates an isolated store with only the target slice active.
- **Component tests**: `ResizeObserver` mock is pre-configured in `src/components/tests/testSetup.ts`.

## Design Direction

- **Neoskeumorphic/skeumorphic** visual style — tactile shadows, realistic depth, dark-first
- **React Bits** for micro-interactions, **motion-primitives** for layout transitions
- Dark-first color scheme — tokens defined in `src/style/theme.css` and `src/main.css`

## Tech Stack

- **TypeScript 6.0** — strict mode, `noUncheckedIndexedAccess: true`
- **React 19** + **Vite 7** — `babel-plugin-react-compiler` enabled via `@vitejs/plugin-react`
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin, no `tailwind.config.js`
- **Zustand 5** — global state (`src/store/useAppStore.ts`), middleware stack: `devtools → persist → immer`
- **Immer 11** — mutation middleware for Zustand; all slice `set()` callbacks use draft-style direct mutation
- **HeroUI v3** — component library (Tailwind v4 compatible); prefer over custom components
- **vite-plugin-pwa 1.2.0** — PWA service worker + manifest
- **Vitest 4** — unit testing framework (co-located `*.test.ts` files)
- **ESLint** — `typescript-eslint` type-checked rules + `eslint-plugin-react-x` + `eslint-plugin-react-dom`
- **Prettier** — empty config (all defaults)

## V1 Scope

1. Core CRUD for agents, skills, snippets + activation/deactivation + output window (live text compilation, copy to clipboard)
2. Skill tagging (many-to-many snippets ↔ skills) + bulk toggle via skill
3. Session commit/discard model
4. Import / Export (full JSON state, replace-not-merge behavior)
5. Drag-and-drop snippet reordering within an agent
6. Node graph deferred to v2

## Documentation

- `docs/architecture.md` — tech stack and app layers
- `docs/models.md` — data model (Snippets, Skills, Agents, derived indexes)
- `docs/styling.md` — design system, component and motion libraries
- `docs/contributing.md` — setup, workflow, code quality gates
- `docs/state-and-data-flow.md` — store, compiler, persistence, import/export

> When the stack changes, update `CLAUDE.md` first. Docs follow. This order ensures the assistant never operates on stale information.

## Recent Changes

- 017-tour-raw-output: Added `tourTarget?: string` prop to `AppSection` so tour highlighting can target a panel independently of its visual variant. Fixed a latent DOM collision where both `OutputStructure` and `RawOutput` emitted `data-tour-target="output"`. Added a dedicated "Raw Output" tour step (now 9 steps total) at index 5 targeting `[data-tour-target="raw-output"]`. Renamed the existing "Output Window" step to "Output Structure" with narrowed copy scoped to the accordion view. Replaced em-dashes with commas in the Agent List and Output Structure step intros.

- 016-in-app-docs: Added in-app documentation modal (`DocsModal`). A `BookOpen` icon button in `AppHeader` (left of the theme toggle) opens a HeroUI modal with four tabs — Introduction, Tips, Tutorials, Sources — each with static content. Uses `Tabs` compound component (first Tabs usage in the project). No Zustand changes; all state is local to the component.
- 015-split-output-window: Split the Output panel into two vertically-stacked sub-sections — "Output Structure" (existing accordion) and "Raw Output" (scrollable `<pre>`). Added a `ButtonGroup` format toggle (XML / Text) that switches the `<pre>` content between `compileOutputXML` and `compileOutputBySkillGroup` output. Relocated the copy button into the Raw Output sub-header; it copies whichever format is currently selected and is disabled when output is empty. Old header copy buttons removed.

## Recent Changes (continued)

- PR #97 (shadow-and-theme-update): shadow depth polish and theme token refinements across all panels.
- PR #95 (tutorial-and-theme-tweaks): tutorial content pass, UI tweaks, switched to Playwright POMs for e2e tests.

## Active Technologies

- TypeScript 6.0 strict, `noUncheckedIndexedAccess: true` + React 19, Vite 7, Zustand 5 + Immer 11, HeroUI v3 (Modal._, Tabs._), intro.js v8, Tailwind CSS v4, lucide-react, pnpm (package manager)
