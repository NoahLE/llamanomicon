# Tasks: Split Output Window

**Input**: Design documents from `/specs/015-split-output-window/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not requested in the feature specification. Test tasks are omitted unless added during Polish phase.

**Organization**: Tasks are grouped by user story to enable independent verification of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Confirm prerequisites — no new infrastructure or dependencies needed for this feature.

- [X] T001 Verify `selectCompiledOutputXML` is exported from `src/store/useSettings.ts` and importable in `src/components/OutputWindow.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared foundational infrastructure is required. All three user stories modify `src/components/OutputWindow.tsx` sequentially; US2 depends on US1's layout and US3 depends on US2's toggle state.

**⚠️ Note**: US1 → US2 → US3 are sequential in this single-file refactor. Each story phase must complete before the next begins.

---

## Phase 3: User Story 1 — Split Output Panel Layout (Priority: P1) 🎯 MVP

**Goal**: The Output panel displays two vertically-stacked sub-sections: Output Structure (top, existing accordion) and Raw Output (bottom, compiled XML text in a `<pre>` element). The toggle and copy button do not exist yet in this phase.

**Independent Test**: Activate snippets, observe two distinct sub-sections. Top accordion expands/collapses as before. Bottom `<pre>` shows compiled XML text. No copy buttons in the header.

### Implementation for User Story 1

- [X] T002 [US1] Restructure the content area of `src/components/OutputWindow.tsx` to a flex-column layout: wrap the existing `Accordion` block in an "Output Structure" `div` with `flex-1 overflow-auto` and add an empty "Raw Output" `div` below it with `shrink-0 border-t border-border` styling
- [X] T003 [US1] Add `xmlOutput` selector call in `src/components/OutputWindow.tsx`: `const xmlOutput = useAppStore(selectCompiledOutputXML)` and display `xmlOutput` inside a styled `<pre>` element (class: `text-sm overflow-auto max-h-40 rounded p-2 bg-black/20 shadow-inner whitespace-pre-wrap break-words`) in the Raw Output section
- [X] T004 [US1] Add a sub-header row inside the Raw Output section of `src/components/OutputWindow.tsx` with a "Raw Output" label styled consistently with the panel's design tokens
- [X] T005 [US1] Update the `AppSection` `controls` prop in `src/components/OutputWindow.tsx` to remove the two existing copy buttons from the header (leave the title; controls becomes empty or removed)

**Checkpoint**: At this point, the output panel shows two sections. Top accordion works as before. Bottom shows XML text in a scrollable `<pre>`. No copy buttons in the header.

---

## Phase 4: User Story 2 — Format Toggle (Priority: P2)

**Goal**: A `ButtonGroup` toggle in the Raw Output section lets the user switch between XML format and plain text format. The `<pre>` content updates immediately on toggle.

**Independent Test**: Activate snippets. Default toggle is "XML" — `<pre>` shows tagged XML. Click "Text" — `<pre>` shows newline-joined plain text. Click "XML" again — reverts.

### Implementation for User Story 2

- [X] T006 [US2] Add `outputFormat` state and `textOutput` selector to `src/components/OutputWindow.tsx`: `const [outputFormat, setOutputFormat] = useState<"xml" | "text">("xml")`, `const textOutput = useAppStore(selectCompiledOutput)`, and derive `const activeOutput = outputFormat === "xml" ? xmlOutput : textOutput`
- [X] T007 [US2] Add the format `ButtonGroup` to the Raw Output sub-header row in `src/components/OutputWindow.tsx`: two `Button` elements ("XML" and "Text"), each using `variant="primary"` when active and `variant="secondary"` when inactive, with `onPress` handlers calling `setOutputFormat`
- [X] T008 [US2] Wire the `<pre>` in `src/components/OutputWindow.tsx` to display `activeOutput` instead of `xmlOutput`; add empty-state placeholder text when `activeOutput` is empty

**Checkpoint**: Toggle switches `<pre>` content between XML and plain text. Format defaults to XML on load.

---

## Phase 5: User Story 3 — Copy Button in Raw Output Section (Priority: P3)

**Goal**: A single copy button lives in the Raw Output section and copies the currently selected format. The two old header copy buttons are fully removed along with their hook instances.

**Independent Test**: Set toggle to XML, click copy, paste — XML format confirmed. Set toggle to Text, click copy, paste — plain text confirmed. Copy button disabled when no output. No copy buttons in the header.

### Implementation for User Story 3

- [X] T009 [US3] Remove the `copyXML` / `copiedXML` `useCopyToClipboard` hook instance from `src/components/OutputWindow.tsx` (the XML-specific one); retain the single `{ copy, copied }` hook for the Raw Output copy button
- [X] T010 [US3] Add a copy `Button` to the Raw Output section of `src/components/OutputWindow.tsx` with `isDisabled={!activeOutput}`, `size="sm"`, `variant="secondary"`, and `onPress={() => copy(activeOutput)}`; show "Copied!" label or a `<Check>` icon feedback when `copied` is true, otherwise show a `<ClipboardCopy>` icon
- [X] T011 [US3] Verify all imports in `src/components/OutputWindow.tsx` are clean: remove any `ClipboardCopy` import if replaced by `Check`, remove `selectCompiledOutput` old binding if renamed, remove unused imports; run `make lint` to confirm zero ESLint/Prettier errors

**Checkpoint**: All three user stories are functional. Two sections visible. Toggle works. Single copy button in Raw Output section copies the correct format. Header has no copy buttons.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tests, documentation, and final validation.

- [X] T012 [P] Write component tests for the split layout and toggle in `src/components/tests/OutputWindow.test.tsx`: cover (1) two sections render, (2) toggle switches `<pre>` content, (3) copy button copies correct format per toggle state, (4) copy button disabled when no output, (5) no copy buttons in header
- [X] T013 [P] Update `CLAUDE.md` Recent Changes section with a `015-split-output-window` entry describing the split layout, format toggle, and copy button relocation
- [X] T014 Run `make build` (TypeScript type-check + production build) and fix any type errors
- [X] T015 Manually verify the feature end-to-end following `specs/015-split-output-window/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: N/A — no blocking infrastructure
- **US1 (Phase 3)**: Depends on Phase 1 completion
- **US2 (Phase 4)**: Depends on US1 completion (layout must exist)
- **US3 (Phase 5)**: Depends on US2 completion (toggle state must exist)
- **Polish (Phase 6)**: Depends on US3 completion

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 1 — independent of other stories
- **US2 (P2)**: Depends on US1 (adds toggle to US1's Raw Output section)
- **US3 (P3)**: Depends on US2 (copy button reads `activeOutput` from US2's toggle)

### Within Each User Story

- All work is sequential within a story (same file)
- T002 → T003 → T004 → T005 (US1)
- T006 → T007 → T008 (US2, after US1)
- T009 → T010 → T011 (US3, after US2)

### Parallel Opportunities

- T012 (tests) and T013 (CLAUDE.md) in Phase 6 can run in parallel — different files

---

## Parallel Example: Polish Phase

```bash
# These two Polish tasks can run simultaneously:
Task T012: "Write tests in src/components/tests/OutputWindow.test.tsx"
Task T013: "Update CLAUDE.md Recent Changes section"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify prerequisites (T001)
2. Complete Phase 3: US1 layout split (T002–T005)
3. **STOP and VALIDATE**: Confirm two sections render, accordion works, XML text shows in bottom
4. Ship / demo the split layout as MVP

### Incremental Delivery

1. T001 → Prereqs confirmed
2. T002–T005 → US1: Panel split visible and testable
3. T006–T008 → US2: Toggle works, format switches
4. T009–T011 → US3: Copy button in place, header clean
5. T012–T015 → Polish: Tests passing, docs updated, build clean

---

## Notes

- All changes are in one file: `src/components/OutputWindow.tsx`
- New test file: `src/components/tests/OutputWindow.test.tsx`
- No store changes, no new dependencies, no new components
- `[P]` tasks in Phase 6 are different files — safe to parallelize
- Commit after each user story phase checkpoint
