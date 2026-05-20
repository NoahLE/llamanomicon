# Research: Component Store Migration & Testing

**Branch**: `001-migrate-components` | **Date**: 2026-04-20

---

## Decision 1: OutputWindow migration approach

**Decision**: Replace all old store references (`s.library`, `s.flows`, `s.activeFlowId`) with the `selectCompiledOutput` selector from `src/store/selectors.ts`, and read the active agent name via `selectActiveAgent`. Remove `// @ts-nocheck`.

**Rationale**: `selectCompiledOutput` already implements the full compilation pipeline (agent → activeOrder → snippet texts → join with separator). Reusing it is simpler and more correct than re-implementing compilation inside the component.

**Alternatives considered**: Accessing store slices directly (bypasses selector memoization, duplicates logic).

---

## Decision 2: SkillsList and SnippetsPanel are already migrated

**Decision**: `SkillsList.tsx` and `SnippetsPanel.tsx` both already use the new store API (`useShallow`, `selectSortedSkills`, `selectSnippetsForSkill`, `selectActiveAgent`, etc.). The only change needed is to uncomment them in `App.tsx`.

**Rationale**: Confirmed by reading both files — they import from `selectors.ts` and call actions via `useAppStore.use.*`. No substantive migration work required.

**Alternatives considered**: None; this is an observation, not a choice.

---

## Decision 3: DOM test environment — per-file jsdom directive

**Decision**: Add `jsdom` as a devDependency and use `// @vitest-environment jsdom` at the top of each component test file rather than setting a global `environment: 'jsdom'` in `vite.config.ts`.

**Rationale**: Store tests run in Node environment (no DOM needed); forcing jsdom globally would slow them down. The per-file directive keeps each suite in its natural environment. This is the Vitest-recommended pattern for mixed test suites.

**Alternatives considered**:
- Global jsdom in vite.config.ts — penalizes store tests unnecessarily.
- happy-dom — faster but less compliant with the DOM spec; RTL recommends jsdom.
- `@vitest/browser` with Playwright — overkill for unit/integration component tests.

**Action required**: `npm install -D jsdom`

---

## Decision 4: Add @testing-library/user-event

**Decision**: Install `@testing-library/user-event` as a devDependency and use it for all interaction simulations in component tests.

**Rationale**: `userEvent` simulates browser events more realistically than RTL's built-in `fireEvent` (dispatches the full event sequence: pointerdown → mousedown → focus → input → etc.). This catches more real interaction bugs. RTL maintainers recommend `userEvent` over `fireEvent` for everything except performance-sensitive tests.

**Alternatives considered**: RTL's `fireEvent` only — simpler but less realistic; skips intermediate events that real browsers fire.

**Action required**: `npm install -D @testing-library/user-event`

---

## Decision 5: Test file location — `src/components/tests/` subdirectory

**Decision**: Place all component tests in `src/components/tests/`, following the pattern already established by `src/store/tests/` and `src/lib/tests/`.

**Rationale**: The user explicitly requested this location. It is consistent with all other test suites in the project (`src/store/tests/`, `src/lib/tests/`) and with Constitution Principle VI (v1.2.2) which codifies the `tests/` subdirectory convention.

**Alternatives considered**: Files directly alongside source (e.g., `AgentList.test.tsx` next to `AgentList.tsx`) — rejected as inconsistent with the project's established convention.

---

## Decision 6: No contracts directory needed

**Decision**: Skip the `/contracts/` directory. This is a pure single-page application with no external API surface — no REST endpoints, no library exports, no CLI commands.

**Rationale**: Contract documentation is only meaningful when the project exposes interfaces to external consumers. All interactions are internal to the app.

---

## Decision 7: Vitest store mock strategy for component tests

**Decision**: Use the existing `createTestStore()` utility from `src/store/tests/testUtils.ts` as the foundation for wiring the Zustand store in component tests. Wrap components with the actual store (not a mock) and use store actions to set up state per the Constitution's "native mechanisms first" rule.

**Rationale**: `createTestStore()` already creates an isolated store instance. Using the real store catches integration bugs. Constitution Principle VI explicitly requires this approach.

**Alternatives considered**: Mocking the entire store module (`vi.mock`) — rejected by constitution; misses integration bugs.
