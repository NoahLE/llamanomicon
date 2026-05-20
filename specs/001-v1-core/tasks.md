---
description: "Task list for Llamanomicon V1 Core implementation"
---

# Tasks: Llamanomicon V1 Core

**Input**: Design documents from `specs/001-v1-core/`
**Prerequisites**: plan.md ✅ | data-model.md ✅ | contracts/ ✅ | research.md ✅ | quickstart.md ✅

**Tests**: None — V1 has no test suite; type system + linter are the quality gate.

**Commands**: All project commands run through the Makefile:

- `make dev` — start dev server (Vite HMR)
- `make build` — type-check + production build
- `make lint` — auto-fix lint + format (ESLint + Prettier)
- `make preview` — preview production build

**User Stories** (derived from plan.md V1 scope; no spec.md present):

- **US1 (P1)**: Core CRUD + Toggle + Live Output Compilation + Copy to Clipboard ← MVP
- **US2 (P2)**: Import / Export (full JSON state, replace-not-merge)
- **US3 (P3)**: Drag-and-drop Snippet Reordering within a Group

**Component structure**: Flat `src/components/` directory. Sub-components use nested
naming prefix (e.g., `FlowList.tsx`, `FlowListItem.tsx`, `FlowListToolbar.tsx`).
shadcn/ui files in `src/components/ui/` are vendor code — do not edit.

**V2 scope** (not in these tasks): GSAP animations, neoskeumorphic design, node graph.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1, US2, or US3
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Install dependencies, configure tooling, and initialize shadcn/ui.

- [x] T001 ~~Install missing npm runtime dependencies~~ — **DONE**: `zustand@5`, `dexie@4`, `dexie-react-hooks@4`, `@dnd-kit/react@0.3.2` installed. Note: user installed `@dnd-kit/react` (new unified package) — NOT `@dnd-kit/core`/`@dnd-kit/sortable`/`@dnd-kit/utilities`. See research.md §3 for the correct API.
- [x] T002 [P] ~~Install missing npm dev dependencies~~ — **DONE**: `vite-plugin-pwa@1.2.0` installed.
- [x] T004 [P] ~~Fix TypeScript path alias in `tsconfig.app.json`~~ — **DONE**: changed `"@/*": ["./*"]` to `"@/*": ["./src/*"]`: change `"@/*": ["./*"]` to `"@/*": ["./src/*"]` — current file already has `"noUncheckedIndexedAccess": true`, `"strict": true`, and the `paths` key, only the alias target value is wrong (points to repo root instead of `src/`)
- [x] T005 [P] ~~Configure `vite.config.ts`~~ — **DONE**: `resolve.alias` for `@`, full `VitePWA` config with manifest, Workbox, icons: add `import path from 'path'` at top; add `resolve: { alias: { '@': path.resolve(__dirname, './src') } }` to `defineConfig`; replace bare `VitePWA()` call with full config: `VitePWA({ registerType: 'autoUpdate', workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] }, manifest: { name: 'Llamanomicon', short_name: 'Llamanomicon', theme_color: '#09090b', background_color: '#09090b', display: 'standalone', icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }, { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }] } })`
- [x] T006 [P] ~~Initialize shadcn/ui~~ — **DONE**: style radix-nova/neutral; all 11 components added to `src/components/ui/`; `components.json` CSS path corrected to `src/index.css`: run `npx shadcn@latest init` (style: Default, base color: Zinc, CSS variables: yes, `@/` alias confirmed as `src/`); then add components: `npx shadcn@latest add button input textarea switch badge dialog dropdown-menu context-menu scroll-area separator sonner`
- [x] T007 [P] ~~Add PWA icon placeholders to `public/`~~ — **DONE**: `android-chrome-192x192.png` and `android-chrome-512x512.png` generated: create or source `android-chrome-192x192.png` and `android-chrome-512x512.png` (use any 192×192 and 512×512 PNG; a plain dark square with a text "Ll" is sufficient for v1)

**Checkpoint**: `make build` completes without errors. `@/` alias resolves. shadcn files present in `src/components/ui/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, store, database, compiler, and layout shell — everything US phases depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 ~~Define all TypeScript interfaces in `src/types/index.ts`~~ — **DONE**: `Snippet`, `Group`, `Library`, `FlowActivation`, `Flow`, `OutputSettings`, `AppState`, `StoreState` all defined with exact shapes from data-model.md; all exported.
- [x] T009 [P] ~~Implement `compileOutput` pure function in `src/lib/compiler.ts`~~ — **DONE**: full normative algorithm implemented; pure function with no side effects.
- [x] T010 [P] ~~Create Dexie.js database in `src/db/database.ts`~~ — **DONE**: `LlamanomiconDB`, `loadState()`, `saveState()` all implemented.
- [x] T011 ~~Create Zustand store in `src/store/useAppStore.ts`~~ — **DONE**: all actions implemented; fire-and-forget Dexie writes; `importState` correctly skips re-save.
- [x] T012 [P] ~~Create `AppLayout` component in `src/components/AppLayout.tsx`~~ — **DONE**: CSS Grid `1fr 1.5fr 1.5fr` / `1fr 1fr` with `100dvh`; all four panels placed correctly.
- [x] T013 [P] ~~Create `PanelCard` component in `src/components/PanelCard.tsx`~~ — **DONE**: dark card with `bg-zinc-900 border border-zinc-800`, V2 upgrade comment, `title`/`className`/`children` props.
- [x] T014 [P] ~~Create `useClipboard` hook in `src/hooks/useClipboard.ts`~~ — **DONE**: `useCopyToClipboard()` with 2000ms `copied` feedback and clipboard unavailability fallback.
- [x] T015 ~~Update `App.tsx`~~ — **DONE**: `useEffect` hydrates from Dexie on mount; renders `<AppLayout />`; no Vite scaffold.
- [x] T016 [P] ~~Update `src/index.css`~~ — **DONE**: `--panel-radius: 0.5rem`, `--panel-gap: 0.5rem`, V2 shadow token comment present.

**Checkpoint**: `make build` passes. All types resolve. Store, DB, compiler, layout exist and compile cleanly.

---

## Phase 3: User Story 1 — Core CRUD + Toggle + Live Output + Copy (Priority: P1) 🎯 MVP

**Goal**: Create Flows, create Groups, add Snippets, toggle them on/off per Flow, see
compiled output update in real time, copy to clipboard.

**Independent Test**: `make dev` → create a Flow → create a Group → add two snippets →
toggle one on → Output Window shows compiled text with group header → click Copy → paste
into text editor and confirm content matches.

- [x] T017 [P] [US1] ~~Create `FlowListToolbar.tsx`~~ — **DONE** in `src/components/`: renders the Flows panel header with panel title and "New Flow" button; "New Flow" opens a shadcn `Dialog` with `Input` for name and emoji `Input` for icon (default "📋"); on submit calls `addFlow(name, icon)` from store; disable submit when name is empty
- [x] T018 [P] [US1] ~~Create `FlowListItem.tsx`~~ — **DONE** in `src/components/`: renders a single flow row with `{icon} {name}`; highlighted (`bg-zinc-800` or ring) when `flow.id === activeFlowId`; click row calls `setActiveFlow(flow.id)`; shadcn `DropdownMenu` on row with items: Rename (opens `Dialog` with pre-filled `Input`), Duplicate (`duplicateFlow`), Delete (`deleteFlow`); accepts `flow: Flow` prop
- [x] T019 [US1] ~~Create `FlowList.tsx`~~ — **DONE** in `src/components/`: root panel component; wraps `<PanelCard>`; renders `<FlowListToolbar />` and maps `flows` from store to `<FlowListItem />`; use shadcn `ScrollArea` for list body; show empty state text ("No flows yet — create one above") when `flows` is empty
- [x] T020 [P] [US1] ~~Create `GroupsListToolbar.tsx`~~ — **DONE** in `src/components/`: renders Groups panel header with title and "New Group" button; opens shadcn `Dialog` with `Input` for name and optional `Input` for description; on submit calls `addGroup(name, description)`; disable submit when name is empty
- [x] T021 [P] [US1] ~~Create `GroupsListItem.tsx`~~ — **DONE** in `src/components/`: renders a single group row; shows `{name}` and optional description as subtitle; shadcn `Switch` bound to `activation.groups[group.id] ?? false` for the active flow — toggle calls `toggleGroup(group.id)`; click row body (not switch) calls `setSelectedGroup(group.id)`; highlighted when `group.id === selectedGroupId`; `DropdownMenu` with Rename and Delete; switch and menu disabled when no flow is active; accepts `group: Group` prop
- [x] T022 [US1] ~~Create `GroupsList.tsx`~~ — **DONE** in `src/components/`: root panel component; wraps `<PanelCard>`; renders `<GroupsListToolbar />` and maps `library.groups` to `<GroupsListItem />`; `ScrollArea` for list body; empty state text when no groups exist
- [x] T023 [P] [US1] ~~Create `SnippetsPanelToolbar.tsx`~~ — **DONE** in `src/components/`: renders Snippets panel header showing selected group name (or "Snippets" when none selected) and "New Snippet" button; button opens shadcn `Dialog` with `Textarea` for snippet text; on submit calls `addSnippet(selectedGroupId!, text)` from store; disable button when no group is selected; disable submit when text is empty
- [x] T024 [P] [US1] ~~Create `SnippetsPanelItem.tsx`~~ — **DONE** (includes US3 dnd-kit wiring) in `src/components/`: renders a single snippet row; shows truncated text preview (`line-clamp-2`); shadcn `Switch` bound to `activation.snippets[snippet.id] ?? false` — toggle calls `toggleSnippet(snippet.id)`; `DropdownMenu` with Edit (opens `Dialog` with full `Textarea` pre-filled, submit calls `updateSnippet`) and Delete (`deleteSnippet`); `GripVertical` icon from `lucide-react` rendered as a visible drag handle button (non-functional stub — US3 wires it); accepts `snippet: Snippet` prop
- [x] T025 [US1] ~~Create `SnippetsPanel.tsx`~~ — **DONE** (includes US3 DragDropProvider) in `src/components/`: root panel component; wraps `<PanelCard>`; renders `<SnippetsPanelToolbar />`; finds selected group from `library.groups` by `selectedGroupId`; maps group's snippets (sorted by `order` ascending) to `<SnippetsPanelItem />`; `ScrollArea` for list body; empty states: "Select a group to view snippets" when no group selected, "No snippets yet — add one above" when group has no snippets
- [x] T026 [US1] ~~Create `OutputWindow.tsx`~~ — **DONE** (includes US2 Import/Export wiring) in `src/components/`: wraps `<PanelCard title="Output">`; derives `activeFlow` from `flows.find(f => f.id === activeFlowId) ?? null`; calls `compileOutput(library, activeFlow, outputSettings)` on every render; renders result in `<pre className="whitespace-pre-wrap overflow-auto">` inside `ScrollArea`; "Copy" button uses `useCopyToClipboard` — button label toggles "Copy" / "Copied!" for 2 s; show placeholder "Select a flow and toggle snippets to see output" when output is empty; render disabled "Import" and "Export" buttons in panel header toolbar (wired in US2)
- [ ] T027 [US1] Verify US1 end-to-end — **PENDING**: run `make dev` and manually test core loop with `make dev`: create flow → create group → add two snippets → toggle one on → confirm output updates in real time → click Copy → paste into text editor and confirm content matches; fix any runtime errors before proceeding

**Checkpoint**: US1 fully functional. Core loop verified end-to-end.

---

## Phase 4: User Story 2 — Import / Export (Priority: P2)

**Goal**: Export full app state to JSON; import to restore state completely (replace-not-merge).

**Independent Test**: With data in the app, click Export → verify a `.json` file is saved
matching `specs/001-v1-core/contracts/state-schema.md`. Clear all data. Click Import →
select the file → verify state is fully restored; `activeFlowId` and `selectedGroupId` reset to null.

- [x] T028 [US2] ~~Implement `src/lib/importExport.ts`~~ — **DONE**: `exportState` + `importStateFromFile` with File System Access API + fallback, JSON validation: export `exportState(state: AppState): Promise<void>` — feature-detect `'showSaveFilePicker' in window`; Chrome/Edge path uses `showSaveFilePicker({ suggestedName: \`llamanomicon-export-${new Date().toISOString().slice(0,10)}.json\` })`; Firefox fallback creates `Blob`, `URL.createObjectURL`, programmatically clicks `<a download>`; always serializes with `JSON.stringify(state, null, 2)`; export `importStateFromFile(): Promise<AppState>`— Chrome/Edge uses`showOpenFilePicker({ types: [{ accept: { 'application/json': ['.json'] } }] })`; Firefox uses programmatic `<input type="file" accept=".json">` trigger; parse JSON; validate required top-level fields (`library.groups`array,`flows`array,`outputSettings`object with`showGroupHeaders`boolean and`snippetSeparator`string); throw descriptive`Error`naming the first missing/invalid field on failure; return validated`AppState`
- [x] T029 [P] [US2] ~~Wire Import and Export buttons in `OutputWindow.tsx`~~ — **DONE**: toast on success/error, AbortError suppressed: "Export" button calls `exportState({ library, flows, outputSettings })` from store via `useAppStore()`; "Import" button calls `importStateFromFile()` then `importState(result)` from store and fires a shadcn `Sonner` toast "State imported successfully"; wrap both handlers in `try/catch` — on error, fire error toast with `error.message`; enable both buttons (remove the disabled stubs from T026)
- [ ] T030 [US2] Verify US2 end-to-end — **PENDING**: manual test with `make dev`: export state → open the JSON file and confirm it matches the state-schema contract → clear all data → import the file → verify full state restore with `activeFlowId` and `selectedGroupId` reset to `null`

**Checkpoint**: US1 and US2 both independently functional.

---

## Phase 5: User Story 3 — Drag-and-Drop Snippet Reordering (Priority: P3)

**Goal**: Drag snippets within the Snippets Panel to reorder them; output reflects new order immediately.

**Independent Test**: `make dev` → select a group with 3+ snippets → drag snippet from
position 1 to position 3 → verify visual reorder → toggle all snippets on → verify output
order matches new order.

- [x] T031 ~~Add `reorderSnippets` to `src/store/useAppStore.ts`~~ — **DONE**: already implemented with inline `arrayMove` splice logic; re-indexes `order` fields after move; fires fire-and-forget `saveState()`.
- [x] T032 [US3] ~~Upgrade `SnippetsPanelItem.tsx`~~ — **DONE**: `useSortable` from `@dnd-kit/react/sortable`, `ref`/`handleRef`/`isDragging` in `src/components/`: add `index: number` prop; import `useSortable` from `@dnd-kit/react/sortable` (NOT `@dnd-kit/sortable`); call `const { ref, handleRef, isDragging } = useSortable({ id: snippet.id, index })`; attach `ref` to row's root `div`; attach `handleRef` to the `GripVertical` drag handle button; apply `style={{ opacity: isDragging ? 0.5 : 1 }}` on root div; no transform/transition CSS needed — library handles visual displacement
- [x] T033 [US3] ~~Upgrade `SnippetsPanel.tsx`~~ — **DONE**: `DragDropProvider`, `handleDragEnd`, `aria-live` announcement in `src/components/`: import `DragDropProvider` from `@dnd-kit/react` (NOT `@dnd-kit/core`); import `type { DragEndEvent }` from `@dnd-kit/react`; wrap snippet list with `<DragDropProvider onDragEnd={handleDragEnd}>`; implement `handleDragEnd = (event: DragEndEvent) => { const { source, target } = event.operation; if (!source || !target || source.id === target.id) return; reorderSnippets(selectedGroupId!, String(source.id), String(target.id)); }`; pass `index` prop to each `<SnippetsPanelItem>`; add `<div aria-live="polite" className="sr-only">` inside panel that announces snippet reorder (update after each drop)

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation compliance, quality gates, and first-run experience.

- [x] T034 [P] ~~Add seed data in `src/App.tsx`~~ — **DONE**: seeds group + 2 snippets + flow + activation on first visit for first-run experience: after `loadState()` resolves, if result is `undefined`, call `addGroup("Coding Best Practices")`, then `addSnippet(groupId, "Keep code modular and loosely coupled")` and `addSnippet(groupId, "Explain assumptions when providing suggestions")`; call `addFlow("Senior Dev Review", "💻")`; call `toggleGroup(groupId)` and `toggleSnippet(firstSnippetId)` on the new flow — gives new users an immediate working demo on first visit
- [ ] T035 [P] Run `make build` and resolve all TypeScript strict-mode errors: pay attention to `noUncheckedIndexedAccess` (array/record access returns `T | undefined` — must guard), missing return types on exported functions, and any implicit `any` from shadcn component usage
- [ ] T036 [P] Run `make lint` and verify zero ESLint and Prettier violations across all new files; fix any remaining issues
- [ ] T037 Verify complete app with `make preview` in incognito: confirm PWA install prompt appears (Chrome/Edge), app works fully offline after first load, and all three user stories function correctly
- [ ] T038 [P] Update `specs/001-v1-core/quickstart.md` if any setup steps changed during implementation (e.g., if shadcn init prompts differed from documented); note any corrections

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T004–T007 complete (especially T006 for shadcn) — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on all Phase 1 + Phase 2 complete
- **US2 (Phase 4)**: Depends on Phase 2 + US1 complete (OutputWindow toolbar must exist)
- **US3 (Phase 5)**: Depends on Phase 2 + US1 complete (SnippetsPanelItem drag handle stub must exist)
  - US2 and US3 can run in parallel after US1
- **Polish (Phase 6)**: Depends on all desired user stories complete

### Within Phase 1 (Setup)

- T004, T005, T006, T007 can run in parallel (independent concerns)
- T005 conceptually depends on T004 (alias value must match) — do them together

### Within US1 (Phase 3)

- T017, T018, T020, T021, T023, T024 can run in parallel (each is a different file)
- T019 (FlowList root) depends on T017 + T018
- T022 (GroupsList root) depends on T020 + T021
- T025 (SnippetsPanel root) depends on T023 + T024
- T026 (OutputWindow) depends on Phase 2 completion (compiler + useClipboard already done)
- T027 (verification) depends on T019 + T022 + T025 + T026

### Parallel Opportunities Summary

| Phase  | Parallel Tasks                                                                          |
| ------ | --------------------------------------------------------------------------------------- |
| Setup  | T004, T005, T006, T007 all parallel                                                     |
| US1    | T017, T018, T020, T021, T023, T024 parallel; T019, T022, T025, T026 parallel after deps |
| US2    | T029 parallel with T028 once T028 complete                                              |
| US3    | T032 parallel with T031 (already done); T033 depends on T032                            |
| Polish | T034, T035, T036, T038 all parallel                                                     |

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T004–T007)
2. Phase 2: Already done (T008–T016 ✅)
3. Complete Phase 3: US1 (T017–T027)
4. **STOP and VALIDATE**: `make dev`, perform core loop manually
5. Polish minimum: T035 (build check) + T036 (lint)

### Incremental Delivery

1. Setup (T004–T007) → skeleton compiles with shadcn and correct aliases
2. US1 (T017–T027) → **shippable MVP**
3. US2 (T028–T030) → data portable → **v1.0 candidate**
4. US3 (T032–T033) → reordering works → **v1.0 complete**
5. Polish (T034–T038) → documentation + quality gates → ready for main

---

## Notes

- `[P]` tasks touch different files — safe to parallelize
- `[Story]` label maps task to user story for traceability
- All file paths relative to repository root
- `make lint` runs both ESLint auto-fix and Prettier auto-fix
- `make build` is the TypeScript strict gate — run before marking any phase complete
- Do not edit files in `src/components/ui/` — shadcn vendor code
- The `importState` action called during boot MUST NOT trigger a Dexie re-save
- GSAP (`gsap` package) is installed but unused in v1; do not import it in any v1 component
- `crypto.randomUUID()` requires secure context (localhost or HTTPS) — dev server satisfies this
- `dexie-react-hooks` is installed but not used in v1 architecture; Zustand is the source of truth
- dnd-kit: use ONLY `@dnd-kit/react` and `@dnd-kit/react/sortable` — do NOT import from
  `@dnd-kit/core`, `@dnd-kit/sortable`, or `@dnd-kit/utilities` (not installed)
- `noUncheckedIndexedAccess: true` means `array[i]` and `record[key]` return `T | undefined` — use optional chaining or explicit guards
