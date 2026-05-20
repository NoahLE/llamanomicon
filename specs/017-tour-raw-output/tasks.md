# Tasks: Tour Raw Output Step and Copy Cleanup

**Input**: Design documents from `specs/017-tour-raw-output/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

Nothing required. Branch `017-tour-raw-output` is already checked out and the repo is clean.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Decouple `data-tour-target` from visual variant in `AppSection`. Required before the Raw Output component can expose its own tour target. Also fixes the latent DOM collision where both `OutputStructure` and `RawOutput` emit `data-tour-target="output"`.

**⚠️ CRITICAL**: T001 must complete before T002.

- [x] T001 Add optional `tourTarget?: string` prop to `AppSectionProps` in `src/components/AppSection.tsx`; update `Card.Root` to use `data-tour-target={tourTarget ?? variant}` so tour targeting is independent of visual variant

**Checkpoint**: `AppSection` accepts `tourTarget`. Both US1 and US2 story tasks can now begin.

---

## Phase 3: User Story 1 - New User Sees Raw Output Explained (Priority: P1) 🎯 MVP

**Goal**: A new user advances through the tour and encounters a dedicated Raw Output step that highlights the Raw Output panel and explains the format toggle and copy button.

**Independent Test**: Launch the tour (click ? button), advance past the Output Structure step, and confirm a Raw Output step appears with the highlight ring targeting the lower output panel. See `quickstart.md` for DOM verification steps.

### Implementation for User Story 1

- [x] T002 [P] [US1] In `src/components/RawOutput.tsx`, pass `tourTarget="raw-output"` to `AppSection` so the Raw Output panel receives `data-tour-target="raw-output"` unconditionally
- [x] T003 [US1] In `src/data/tour.ts`, insert a new Raw Output tour step at index 5 (after the Output Structure step, before Session Controls) with `element: '[data-tour-target="raw-output"]'`, `title: "Raw Output"`, and intro text explaining the XML/Text toggle and copy button — no em-dashes

**Checkpoint**: Tour now contains 9 steps. The Raw Output step highlights `[data-tour-target="raw-output"]` specifically.

---

## Phase 4: User Story 2 - All Tour Copy is Em-Dash Free (Priority: P2)

**Goal**: Every tour step title and intro text is free of em-dash characters. The existing Output Structure step is also updated to scope its copy to the accordion panel.

**Independent Test**: Read every tooltip in the tour from start to finish. Confirm zero `—` characters appear. Confirm step 4 (Output Structure) specifically describes the skill-group accordion, not the full output column.

### Implementation for User Story 2

- [x] T004 [US2] In `src/data/tour.ts`, replace the em-dash in the Agent List step intro (`"Agents are your prompt profiles — one per context..."`) with a comma
- [x] T005 [US2] In `src/data/tour.ts`, replace the em-dash in the Output Window step intro (`"send it straight to your clipboard — ready to paste..."`) with a comma; update the step title from `"Output Window"` to `"Output Structure"`; narrow the intro copy to describe the skill-grouped accordion view specifically

**Checkpoint**: All 9 tour steps are em-dash free. Step 4 (Output Structure) and step 5 (Raw Output) each describe their own panel distinctly.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T006 Update `CLAUDE.md` "Recent Changes" section to document the `tourTarget` prop addition to `AppSection`, the new Raw Output tour step, and the em-dash copy cleanup
- [x] T007 Run `make lint && make build` to confirm clean TypeScript, ESLint, Prettier, and production build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **User Story 1 (Phase 3)**: T002 and T003 depend on T001
- **User Story 2 (Phase 4)**: T004 and T005 depend only on T001 (AppSection change is not required for em-dash edits, but T001 should complete first to keep the branch clean)
- **Polish (Phase 5)**: Depends on all story phases being complete

### User Story Dependencies

- **US1 (P1)**: Depends on T001. T002 and T003 are independent of each other (different files).
- **US2 (P2)**: Depends on T001. T004 and T005 are sequential (same file, `tour.ts`).

### Within Each User Story

- T001 → T002 (different file, parallel with T003/T004/T005 once T001 done)
- T001 → T003 (same file as T004/T005; must be sequential within `tour.ts`)
- T001 → T004 → T005 (same file; sequential)

---

## Parallel Opportunities

```
Phase 2 complete (T001 done)
 ├─ T002 [US1] RawOutput.tsx       ← in parallel with T003 and T004/T005
 ├─ T003 [US1] tour.ts (new step)  ← sequential with T004, T005 (same file)
 ├─ T004 [US2] tour.ts (em-dashes)
 └─ T005 [US2] tour.ts (OS step)
```

T002 (`RawOutput.tsx`) can be done simultaneously with all `tour.ts` changes since it touches a different file.

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete T001 (Foundational)
2. Complete T002 + T003 (US1)
3. **Validate**: Run the tour, confirm Raw Output step appears and targets the correct element
4. Optionally stop here and demo

### Full Delivery

1. T001 → T002, T003 (US1) → T004, T005 (US2) → T006, T007 (Polish)
2. Each checkpoint validates the stories independently before moving on

---

## Notes

- No new files created — all changes are additive modifications to 3 existing source files
- No test files required for this feature
- `tour.ts` changes (T003, T004, T005) must be applied sequentially to avoid conflicts; T002 is fully parallel with these
- Commit after T001, after US1 complete, after US2 complete, after Polish
