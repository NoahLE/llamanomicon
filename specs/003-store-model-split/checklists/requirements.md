# Requirements Checklist: Store Model Split

## Spec Quality

- [x] All user stories have priorities assigned
- [x] Each user story is independently testable
- [x] No NEEDS CLARIFICATION markers in requirements
- [x] All success criteria are measurable and technology-agnostic
- [x] Edge cases are enumerated

## Functional Requirements Coverage

- [x] FR-001: Store split into useFlows, useGroups, useSnippets, useSettings
- [x] FR-002: Each slice exports state shape + CRUD actions
- [x] FR-003: Cross-slice cleanup lives in utility modules
- [x] FR-004: TSX components contain only UI state and store action calls
- [x] FR-005: Derived state (activation counts, selection status) moved to selectors
- [x] FR-006: Root useAppStore merges all slices; existing import lines unchanged
- [x] FR-007: All existing features work after refactor (no regressions)
- [x] FR-008: Auto-deactivate group logic lives in useFlows.toggleSnippet action
- [x] FR-009: Persistence triggered at store level, not in components

## Implementation Checklist

- [x] `src/store/utils/storeUtils.ts` — shared utilities (cleanFlowsOnGroupDelete, cleanFlowsOnSnippetDelete, reindexSnippetOrder)
- [x] `src/store/useGroups.ts` — groups slice
- [x] `src/store/useSnippets.ts` — snippets slice
- [x] `src/store/useFlows.ts` — flows slice with toggle logic
- [x] `src/store/useSettings.ts` — settings slice
- [x] `src/store/useAppStore.ts` — root merge of all slices
- [x] `src/components/GroupsListItem.tsx` — derived state removed, selector used
- [x] `src/components/SnippetsPanelItem.tsx` — no inline business logic
- [x] `src/components/OutputWindow.tsx` — import/export error handling at store level

## Verification

- [x] `make dev` — app loads, all panels render
- [x] Flow CRUD works
- [x] Group CRUD works
- [x] Snippet CRUD works
- [x] Toggle group off — all snippets deactivate
- [x] Toggle last snippet off — group auto-deactivates
- [x] Drag reorder persists on reload
- [x] Export → Import round-trip preserves full state
- [x] Output compiles correctly
- [x] No `uuid`, `Math.max`, or inline array mutations in TSX files
