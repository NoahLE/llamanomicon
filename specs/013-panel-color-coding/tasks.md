# Tasks: Panel Color Coding

**Input**: Design documents from `/specs/013-panel-color-coding/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/app-section-variant.md ✅, quickstart.md ✅

**Tests**: One component test required (constitution check — conditional Output glow, US2).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- All paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: No project initialization required — this is a pure CSS/React styling feature on an established project. Confirm starting state.

- [x] T001 Confirm active branch is `013-panel-color-coding` (`git branch --show-current`) and that `src/style/theme.css`, `src/components/AppSection.tsx` exist at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS token definitions and the shared `AppSection` variant system must exist before any panel component can be wired. These two tasks block all user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Define the 14 dark-mode CSS custom properties for all four panel variants in the `:root` block of `src/style/theme.css` — follow the token schema from `specs/013-panel-color-coding/data-model.md`: `--panel-agents-shadow`, `--panel-agents-border-color`, `--panel-agents-title-color`, `--panel-agents-title-glow` (electric cyan); `--panel-skills-shadow`, `--panel-skills-border-color`, `--panel-skills-title-color`, `--panel-skills-title-glow` (amber gold); `--panel-snippets-shadow`, `--panel-snippets-border-color`, `--panel-snippets-title-color`, `--panel-snippets-title-glow` (violet); `--panel-output-shadow`, `--panel-output-border-color` (signal green — no title tokens). Each shadow value uses the 5-layer anatomy from data-model.md.

- [x] T003 [P] Define light-mode overrides for all four panel variants in the `[data-theme="light"]` block of `src/style/theme.css` — softer, lower-saturation values; no neon bloom layers; `--panel-{variant}-title-glow` resolves to `none` for all three left-column variants.

- [x] T004 Extend `src/components/AppSection.tsx` with the variant system per `specs/013-panel-color-coding/contracts/app-section-variant.md`: add `type PanelVariant = "agents" | "skills" | "snippets" | "output"`; add `variant?: PanelVariant` to `AppSectionProps`; add a `variantTokens` record mapping each variant to its CSS variable references (`shadow`, `border`, optional `titleColor`, optional `titleGlow`); compute `cardStyle: CSSProperties` (`boxShadow` + `borderColor`) and `titleStyle: CSSProperties` (guarded by `tokens?.titleColor`); apply `cardStyle` via `style` prop on `Card.Root` and `titleStyle` via `style` prop on the header `<h2>`.

**Checkpoint**: Token definitions exist in `theme.css` and `AppSection` accepts a `variant` prop — panel components can now be wired.

---

## Phase 3: User Story 1 — Distinct Panel Identity at a Glance (Priority: P1) 🎯 MVP

**Goal**: Agents, Skills, and Snippets panels each display a unique persistent color identity (border, glow, title) in both dark and light themes.

**Independent Test**: Load the app in dark mode. Confirm Agents panel shows electric cyan border + glow + title. Confirm Skills panel shows amber-gold. Confirm Snippets panel shows violet. Switch to light mode and confirm each panel still shows its color (softer, no neon).

- [x] T005 [P] [US1] Add `variant="agents"` prop to the `<AppSection>` call in `src/components/Agents.tsx`

- [x] T006 [P] [US1] Add `variant="skills"` prop to the `<AppSection>` call in `src/components/Skills.tsx`

- [x] T007 [P] [US1] Add `variant="snippets"` prop to the `<AppSection>` call in `src/components/Snippets.tsx`

**Checkpoint**: All three left-column panels display their distinct color identities. User Story 1 is fully functional and independently verifiable.

---

## Phase 4: User Story 2 — Output Panel Signals Readiness (Priority: P2)

**Goal**: Output panel displays a green border and glow only when compiled output is non-empty; reverts to neutral when output is empty.

**Independent Test**: With no agent selected, confirm Output panel has no colored glow. Select an agent, activate one snippet, confirm green glow appears immediately. Deactivate all snippets, confirm glow disappears.

- [x] T008 [US2] Add `variant={output ? "output" : undefined}` to the `<AppSection>` call in `src/components/OutputWindow.tsx` — `output` is already available as `const output = useAppStore(selectCompiledOutput)` in that component.

- [x] T009 [US2] Write a component test in `src/components/tests/OutputWindow.test.tsx` that verifies: (a) when no agent is selected the `AppSection` receives no `variant` prop, and (b) when an agent with an active snippet is selected the `AppSection` receives `variant="output"`. Use the existing `createTestStore` utility pattern from `src/store/tests/testUtils.ts` and the established `ResizeObserver` mock from `src/components/tests/testSetup.ts`.

**Checkpoint**: Output glow activates and deactivates reactively. User Story 2 is fully functional and component-tested.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, lint gate, and visual sign-off.

- [x] T010 [P] Update `docs/styling.md` — add a `### Panel tokens (--panel-*)` subsection under `## Depth Token System` documenting: the four variants and their hue families (table), the token schema (table with all four token roles), the conditional Output usage pattern, and the inline style convention. See `specs/013-panel-color-coding/data-model.md` for the token schema and shadow anatomy to reference.

- [x] T011 [P] Update the `## Recent Changes` section of `CLAUDE.md` with a `013-panel-color-coding` entry describing: the 14 `--panel-*` CSS tokens added to `src/style/theme.css`, the `PanelVariant` type and `variant` prop added to `AppSection`, which panels received which variant, and that the Output glow is conditional on non-empty compiled output.

- [x] T012 Run `make lint` and confirm zero TypeScript errors, zero ESLint violations, and Prettier formatting passes.

- [x] T013 Visual sign-off per `specs/013-panel-color-coding/quickstart.md`: run `make dev`, confirm cyan/amber/violet glows on left-column panels in dark mode, confirm softer equivalents in light mode, confirm green Output glow activates on snippet activation and deactivates on full deactivation, confirm Output panel is neutral when no agent is selected.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **blocks all user story work**
- **User Story 1 (Phase 3)**: Depends on Phase 2 — T005, T006, T007 can all run in parallel
- **User Story 2 (Phase 4)**: Depends on Phase 2 — T008 and T009 run sequentially (test informs implementation)
- **Polish (Phase 5)**: Depends on Phase 3 + Phase 4 — T010/T011 can run in parallel; T012 after T010/T011; T013 last

### User Story Dependencies

- **User Story 1 (P1)**: Requires only the foundational `AppSection` variant system (T004). No dependency on US2.
- **User Story 2 (P2)**: Requires only the foundational `AppSection` variant system (T004). No dependency on US1.
- Both user stories are independently implementable once Phase 2 is complete.

### Within Phase 2

- T002 and T003 can run in parallel (both are edits to `theme.css` in different blocks — coordinate to avoid conflicts, or do T002 then T003 sequentially in the same file)
- T004 depends on T002 + T003 being present so CSS variable references resolve correctly

### Parallel Opportunities

- T002 + T003: both are `theme.css` edits, do sequentially in one pass
- T005 + T006 + T007: three different component files, fully parallel
- T010 + T011: `docs/styling.md` and `CLAUDE.md` — fully parallel

---

## Parallel Example: User Story 1

```bash
# Once Phase 2 is complete, wire all three left-column panels simultaneously:
Task T005: "Add variant='agents' to AppSection in src/components/Agents.tsx"
Task T006: "Add variant='skills' to AppSection in src/components/Skills.tsx"
Task T007: "Add variant='snippets' to AppSection in src/components/Snippets.tsx"
```

## Parallel Example: Polish Phase

```bash
# Docs and CLAUDE.md update are independent:
Task T010: "Update docs/styling.md panel token section"
Task T011: "Update CLAUDE.md Recent Changes for 013-panel-color-coding"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002 → T003 → T004)
3. Complete Phase 3: US1 (T005 + T006 + T007 in parallel)
4. **STOP and VALIDATE**: Load app in dark mode, confirm three panel color identities
5. Ship MVP — the core visual identity is complete

### Incremental Delivery

1. Setup + Foundational → variant system ready
2. US1 (T005–T007) → three panels colored, independently verifiable ✅
3. US2 (T008–T009) → Output glow reactive + tested ✅
4. Polish (T010–T013) → docs complete, lint clean, visual sign-off ✅

### Total Task Count

| Phase | Tasks | Parallelizable |
| ----- | ----- | -------------- |
| Setup | 1 | 0 |
| Foundational | 3 | 1 (T002+T003 in same file) |
| US1 (P1) | 3 | 3 |
| US2 (P2) | 2 | 0 |
| Polish | 4 | 2 |
| **Total** | **13** | **6** |

---

## Notes

- T002 and T003 both touch `src/style/theme.css` — do in one editing pass rather than in parallel
- T009 (OutputWindow test) should be written to verify the `variant` prop value passed to `AppSection`, not internal CSS — test at the React component boundary
- T010 and T011 are already partially complete from the `/speckit.plan` run; verify and check off if content matches
- Commit after each phase checkpoint, not after every individual task
- Run `make lint` (T012) before the visual sign-off (T013) — type errors would invalidate visual results
