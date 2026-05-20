# Store API Contract Checklist

**Feature**: `003-store-model-split` | **Date**: 2026-03-24
**Audience**: PR reviewer
**Purpose**: Validate the quality of store API contract documentation — not the implementation.
**IDs**: CHK001–CHK040

**Traceability format**: `[Quality Dimension, §Source]` or `[Gap]`
**Quality Dimensions**: Completeness, Clarity, Consistency, AC Quality, Scenario Coverage, Cross-Slice (Gating), Persistence (Gating), Edge Case, NFR, Assumptions

> **Resolution scope**: These items are contract documentation gaps — they are resolved by updating `specs/003-store-model-split/contracts/store-api.md` and/or `data-model.md`, not by implementation changes. Items marked **Gating** (CHK033–CHK040) must be resolved before PR merge. All others are documentation debt acceptable to carry into `main` with a follow-up issue.

---

## Category 1: Requirement Completeness

_Are all action/selector signatures and their side-effects fully documented?_

- [ ] **CHK001** `[Completeness, contracts/store-api.md §Group actions]` — `deleteGroup` side-effect table lists only "Persists ✅" but omits: (a) `selectedGroupId` set to null if the deleted group was selected, and (b) all flow activation entries for the group and its snippets are cleaned. Both are specified in `data-model.md §State Transitions`; the contract table is incomplete.

- [ ] **CHK002** `[Completeness, contracts/store-api.md §Flow actions]` — `deleteFlow` has no side-effect column. The spec (edge cases, spec.md §Edge Cases) says deleting the active flow sets `activeFlowId` to null or the next available flow; neither path is documented in the contract table.

- [ ] **CHK003** `[Completeness, contracts/store-api.md §Flow actions]` — `duplicateFlow` lists no side-effect description. The contract does not specify: (a) what fields are copied, (b) whether the activation map is deep-copied or shared, (c) whether the duplicate becomes the active flow.

- [ ] **CHK004** `[Completeness, contracts/store-api.md §Activation actions]` — `toggleGroup` side-effect says "Sets all group's snippets to same active state." The contract omits the condition: this only applies to snippets in the **active flow** (`activeFlowId`). Behavior when `activeFlowId` is null is unspecified.

- [ ] **CHK005** `[Completeness, contracts/store-api.md §Activation actions]` — `toggleSnippet` side-effect says "Auto-deactivates parent group if last active snippet turns off." The contract does not specify how the action locates the parent group (requires reading `library` from the groups slice). The cross-slice read dependency is undocumented.

- [ ] **CHK006** `[Completeness, contracts/store-api.md §Import/Export]` — `importState` notes "caller triggers Dexie write separately." No contract section specifies what "separately" means, which caller is responsible, or what happens if that write is omitted. `data-model.md §Persistence Model` clarifies this (boot hydration via `loadState()` in `App.tsx`), but the contract should reference it.

- [ ] **CHK007** `[Completeness, contracts/store-api.md §Selector functions]` — `selectActiveSnippetCount` return type is `number` but no contract specifies the return value when `activeFlow` is null or undefined (0, undefined, or error).

- [ ] **CHK008** `[Completeness, contracts/store-api.md §Selector functions]` — `selectIsGroupActive` and `selectIsSnippetActive` have no documented return value when `activeFlow` is null/undefined or when the ID does not exist in the activation map.

- [ ] **CHK009** `[Completeness, data-model.md §Shared Utilities]` — `reindexSnippetOrder` input contract is unspecified: does the input array need to be pre-sorted? What ordering assumption does the function make? The output (0-based contiguous sequence) is documented in Invariant 1, but the input precondition is missing.

- [ ] **CHK010** `[Completeness, spec.md §Key Entities]` — `updateSnippet(id, text)` side-effect is absent from both the contract table and state transitions section. `data-model.md §State Transitions` shows `text = trimmed` but "trimmed" is not defined (trim whitespace? truncate length?).

---

## Category 2: Requirement Clarity

_Are vague terms quantified or defined?_

- [ ] **CHK011** `[Clarity, spec.md §SC-001]` — SC-001 says "Zero business logic statements exist in TSX component files." `spec.md §Assumptions` defines business logic as "ID generation, order calculation, cross-entity cleanup, activation rules, validation." The definition is enumerated but not exhaustive — it is unclear whether output compilation logic (the compiler loop) falls in-scope. The contract should reference this definition explicitly.

- [ ] **CHK012** `[Clarity, spec.md §FR-002]` — FR-002 says "no nested sub-objects grouping related actions." The term "nested sub-objects" is clear, but "grouping related actions" implies intent. The constraint should specify that the prohibition applies to the **return value** of the creator function, not to variables used internally.

- [ ] **CHK013** `[Clarity, data-model.md §State Transitions]` — `updateSnippet` shows `text = trimmed` without defining the trimming operation. Trim leading/trailing whitespace only, or also collapse internal whitespace? This is observable behavior affecting tests.

- [ ] **CHK014** `[Clarity, contracts/store-api.md §Invariants]` — Invariant 6 says AppState is "always serializable to JSON (no functions, no circular refs, no `undefined` values in persisted fields)." "No `undefined` values in persisted fields" conflicts with `Group.description?: string` and `Flow.description?: string`, which are typed as `string | undefined`. The contract needs to specify whether `undefined` optional fields are excluded from serialization or must be converted to null.

- [ ] **CHK015** `[Clarity, spec.md §FR-003]` — FR-003 says shared cross-store logic "MUST live in utility modules, not inside component files." The "not inside component files" phrasing implies components are the only prohibited location; the requirement should also explicitly exclude slice files (business logic concentrated in one slice that belongs to another domain is also a violation).

- [ ] **CHK016** `[Clarity, data-model.md §FlowsSlice note]` — "toggleGroup and toggleSnippet operate on the activeFlowId flow" — the behavior when `activeFlowId` is null is described nowhere. Should the action be a no-op? Should it throw? Should it warn?

---

## Category 3: Requirement Consistency

_Do contracts align across spec.md, data-model.md, and store-api.md?_

- [ ] **CHK017** `[Consistency, contracts/store-api.md vs data-model.md §FlowsSlice]` — `contracts/store-api.md` places `toggleGroup` and `toggleSnippet` under "Activation actions" separate from "Flow actions." `data-model.md §FlowsSlice` places all of them inside `FlowsSlice`. The contract table grouping does not match the slice ownership model, which may mislead a reviewer about which file implements these actions.

- [ ] **CHK018** `[Consistency, spec.md §FR-009 vs data-model.md §Persistence Model]` — FR-009 says persistence is "triggered via a single `persist()` closure inside the root `useAppStore` creator." `data-model.md §Persistence Model` says it is "triggered by: every mutating action." These are consistent in intent but FR-009 describes the mechanism while the data model describes the trigger. Neither document clarifies whether `persist()` is called synchronously within the action or deferred (e.g., microtask/setTimeout).

- [ ] **CHK019** `[Consistency, contracts/store-api.md §Import/Export vs data-model.md §importState]` — `contracts/store-api.md` says `importState` "Persists ❌ (caller triggers Dexie write separately)." `data-model.md` says it "does NOT call `persist()` to avoid double-write on boot hydration." These imply different scenarios (import-from-file vs boot hydration) but both result in no persist call. The two different motivations are never reconciled — the contract should acknowledge both scenarios.

- [ ] **CHK020** `[Consistency, spec.md §Edge Cases vs contracts/store-api.md §deleteFlow]` — `spec.md §Edge Cases` says "Deleting the active flow sets `activeFlowId` to null or the next available flow." The phrase "or the next available flow" implies conditional logic, but `contracts/store-api.md` has no side-effect for `deleteFlow`. The two documents are misaligned.

- [ ] **CHK021** `[Consistency, spec.md §Key Entities vs data-model.md §SnippetsSlice]` — `spec.md §Key Entities` says `useSnippets` "operates on `library` owned by groups slice." `data-model.md §SnippetsSlice` confirms no owned state. Neither document specifies how `createSnippetsSlice` accesses `library` from the groups slice during a `set()` call — whether via `get().library` or by reading from the incoming state in the `set` callback.

---

## Category 4: Acceptance Criteria Quality

_Are SC-001–SC-006 success criteria measurable/testable?_

- [ ] **CHK022** `[AC Quality, spec.md §SC-001]` — SC-001 ("Zero business logic statements") is not mechanically verifiable without an automated linter rule or explicit file-level ban. The criterion should specify whether it is validated via code review, a custom ESLint rule, or grep pattern. As written it is a manual checklist item, not a testable gate.

- [ ] **CHK023** `[AC Quality, spec.md §SC-002]` — SC-002 ("All existing features work identically") is unmeasurable without a baseline. No existing test suite exists (per CLAUDE.md). The criterion should either: (a) specify a manual smoke-test checklist, or (b) acknowledge the absence of automated tests and define the manual verification steps.

- [ ] **CHK024** `[AC Quality, spec.md §SC-003]` — SC-003 ("Each store slice file is independently importable and testable without rendering any component") is a structural property. The criterion should specify the observable check: e.g., calling a slice creator function in Node.js without importing any React component succeeds without error.

- [ ] **CHK025** `[AC Quality, spec.md §SC-004]` — SC-004 ("No code duplication exists for cross-slice cleanup logic") is verifiable by confirming each utility function has exactly one definition and is imported where needed. The criterion should reference the specific utilities: `cleanFlowsOnGroupDelete`, `cleanFlowsOnSnippetDelete`, `reindexSnippetOrder`.

- [ ] **CHK026** `[AC Quality, spec.md §SC-005]` — SC-005 ("A developer adding a new action … can do so by editing only the relevant slice file") is a design intent criterion, not an observable outcome. It cannot be verified on a completed implementation without adding an action. The criterion should be rephrased as a structural property: "No action implementation spans more than one slice file, except via explicit calls to shared utilities."

- [ ] **CHK027** `[AC Quality, spec.md §SC-006]` — SC-006 ("No nested sub-objects appear inside any slice creator return value") is mechanically verifiable via code review. The criterion should clarify whether TypeScript interfaces are also subject to this constraint or only the runtime return value.

---

## Category 5: Scenario Coverage

_Are all user stories (US1–US4) and their alternate/error flows addressed?_

- [ ] **CHK028** `[Scenario Coverage, spec.md §US1]` — US1 acceptance scenario 1 says "state is persisted" but provides no observable definition of persistence success (e.g., Dexie `put` called once, no error thrown). The scenario conflates the action behavior with persistence without specifying how to distinguish a failed persist from a successful one.

- [ ] **CHK029** `[Scenario Coverage, spec.md §US2]` — US2 acceptance scenario 2 ("last active snippet … toggles off → parent group marked inactive") does not cover the inverse: toggling ON the only snippet in a group should the group auto-activate? This case is neither confirmed nor denied by any document.

- [ ] **CHK030** `[Scenario Coverage, spec.md §US3]` — US3 covers selectors for group activation (all/partial/none/empty) but no scenario covers `selectActiveSnippetCount` when a group has snippets but none appear in the flow's activation map (newly added snippets whose IDs are not yet in `Flow.activation.snippets`). The expected count (0 or undefined) is unspecified.

- [ ] **CHK031** `[Scenario Coverage, spec.md §US4]` — US4 acceptance scenario 2 says `deleteGroup` runs a shared utility that "removes the groupId and all its snippet IDs from all flows." The scenario specifies cleanup of **all flows**, but no scenario covers the case where `activeFlowId` is one of the cleaned flows — specifically whether `activeFlowId` is reset or preserved after the cleanup.

- [ ] **CHK032** `[Gap]` — No user story covers the import/export flow end-to-end. Specifically: what happens if `importState` is called while a flow is active (`activeFlowId` is not null) and the imported state contains no matching flow ID? The reset to null is documented in `data-model.md §importState`, but no user story validates the UX consequence.

---

## Category 6: Cross-Slice Utilities (Gating)

_Are edge cases for shared utilities fully specified? — REQUIRED for PR merge._

- [ ] **CHK033** `[Cross-Slice (Gating), data-model.md §Shared Utilities]` — `cleanFlowsOnGroupDelete(flows, groupId, snippetIds)` — the contract does not specify behavior when `snippetIds` is empty (group had no snippets). Does the function still remove the `groupId` key from `flow.activation.groups`? This is observable and must be specified.

- [ ] **CHK034** `[Cross-Slice (Gating), data-model.md §Shared Utilities]` — `cleanFlowsOnGroupDelete` — no contract specifies behavior when `groupId` does not exist in a flow's `activation.groups` map (e.g., group was never toggled). Should the function skip silently, or does it always attempt a delete?

- [ ] **CHK035** `[Cross-Slice (Gating), data-model.md §Shared Utilities]` — `cleanFlowsOnSnippetDelete(flows, snippetId)` — no contract specifies behavior when `snippetId` does not appear in any flow's `activation.snippets` map. Should it be a pure pass-through (return flows unchanged) or does the absence indicate a data integrity issue?

- [ ] **CHK036** `[Cross-Slice (Gating), data-model.md §Shared Utilities]` — `cleanFlowsOnSnippetDelete` — after removing a snippet from a flow, if the snippet's parent group now has zero active snippets, should the group's activation entry also be set to false? The utility contract is silent; this creates a gap with Invariant behavior (a group marked active with no active snippets).

- [ ] **CHK037** `[Cross-Slice (Gating), data-model.md §Shared Utilities]` — `reindexSnippetOrder(snippets)` — the contract (data-model.md §Invariants, item 1) states the output is a "contiguous 0-based integer sequence." The utility contract does not specify: (a) whether input order is preserved or re-sorted, (b) what happens with an empty input array, (c) whether it mutates in place or returns a new array.

---

## Category 7: Persistence Invariants (Gating)

_Are failure, partial-write, and recovery scenarios defined? — REQUIRED for PR merge._

- [ ] **CHK038** `[Persistence (Gating), data-model.md §Persistence Model]` — The persistence contract documents the happy path only: `persist()` calls Dexie `put()` (upsert). No contract specifies what happens on Dexie write failure (IndexedDB quota exceeded, private browsing restrictions, browser storage disabled). Is the error swallowed, surfaced to the UI, or logged?

- [ ] **CHK039** `[Persistence (Gating), data-model.md §Persistence Model]` — The contract states `persist()` is called by every mutating action. No contract specifies the atomicity guarantee: if `persist()` fails mid-write, does the in-memory Zustand state remain mutated while the persisted state is stale? This partial-write scenario is the highest-risk failure mode for a local-first app.

- [ ] **CHK040** `[Persistence (Gating), data-model.md §Persistence Model]` — The `loadState()` recovery path (boot hydration) is described as reading from Dexie and calling `importState`. No contract specifies what happens when Dexie contains a corrupted or schema-incompatible snapshot: is there a fallback to empty initial state, or does the app fail to initialize?

---

## Category 8: Edge Case Coverage

_Are boundary conditions defined?_

- [ ] **CHK041** `[Edge Case, spec.md §Edge Cases]` — "Deleting the currently selected group clears `selectedGroupId`" is listed as an edge case in spec.md but does not appear as a documented side-effect in `contracts/store-api.md §deleteGroup`. The contract is the normative document; edge cases in spec.md must be reflected there.

- [ ] **CHK042** `[Edge Case, contracts/store-api.md §Invariants]` — Invariant 4 says "if `activeFlowId` is not null, it references a flow that exists in `flows[]`." No contract specifies which action is responsible for enforcing this after `deleteFlow`. The invariant is stated but not owned.

- [ ] **CHK043** `[Edge Case, data-model.md §addSnippet]` — `addSnippet(groupId, text)` — no contract specifies behavior when `groupId` does not exist in `library.groups`. Is this a silent no-op, an error, or undefined behavior?

- [ ] **CHK044** `[Edge Case, data-model.md §reorderSnippets]` — `reorderSnippets(groupId, activeId, overId)` — no contract specifies behavior when `activeId === overId` (drag-and-drop onto itself). Should it be a no-op (no state change, no persist call)?

---

## Category 9: Non-Functional Requirements

_Are TypeScript strictness, serializability, and performance requirements documented?_

- [ ] **CHK045** `[NFR, research.md §D2]` — `StoreData` is introduced to prevent circular imports. No contract specifies what happens if a future developer adds a function-typed field to `StoreData` (violating the "data only, no functions" rule). The NFR should state this constraint explicitly in `data-model.md §StoreData`.

- [ ] **CHK046** `[NFR, contracts/store-api.md §Invariants]` — Invariant 6 requires JSON serializability. No contract specifies how serializability is enforced (TypeScript types, runtime validation on persist, or review convention). The NFR is aspirational without an enforcement mechanism.

- [ ] **CHK047** `[NFR, spec.md §Assumptions]` — "No test framework is introduced in this refactor." SC-003 (slices independently importable/testable) is stated as a success criterion, but with no test framework, it is unverifiable in this branch. The spec should acknowledge this limitation explicitly rather than listing it only in Assumptions.

---

## Category 10: Dependencies & Assumptions

_Are key assumptions validated against the implementation?_

- [ ] **CHK048** `[Assumptions, spec.md §Assumptions]` — "The single `useAppStore` hook interface is preserved as a root merge — components don't need to change their import lines." This is an assumption, not a requirement. If any component imports from a slice file directly (e.g., `import { createGroupsSlice } from '@/store/useGroups'`), the assumption fails silently. The contract should specify that slice files export only creator functions and interfaces, not the store hook.

- [ ] **CHK049** `[Assumptions, spec.md §Assumptions]` — "Snippets and Groups are global. Editing a snippet updates all flows that reference it — no forking on edit." This assumption (from CLAUDE.md architecture section) is referenced nowhere in the store contracts. `updateSnippet` and `updateGroup` have no cross-flow implications documented because the data model never copies snippets into flows, but this design decision is only implicit.

- [ ] **CHK050** `[Assumptions, research.md §D1]` — Decision D1 says standalone `create()` per domain was rejected because "cross-slice reads require either circular imports or a shared pub/sub mechanism." The assumption that slice creator functions always have access to the full store state via `get()` is never documented as a contract requirement. If a future slice uses `get()` to read another slice's state, this pattern must be explicitly blessed in the contracts.

---

## Traceability Summary

| Category | Items | Items with References | Coverage |
|---|---|---|---|
| Requirement Completeness | CHK001–CHK010 | 10/10 | 100% |
| Requirement Clarity | CHK011–CHK016 | 6/6 | 100% |
| Requirement Consistency | CHK017–CHK021 | 5/5 | 100% |
| Acceptance Criteria Quality | CHK022–CHK027 | 6/6 | 100% |
| Scenario Coverage | CHK028–CHK032 | 4/5 | 80% |
| Cross-Slice Utilities (Gating) | CHK033–CHK037 | 5/5 | 100% |
| Persistence Invariants (Gating) | CHK038–CHK040 | 3/3 | 100% |
| Edge Case Coverage | CHK041–CHK044 | 4/4 | 100% |
| Non-Functional Requirements | CHK045–CHK047 | 3/3 | 100% |
| Dependencies & Assumptions | CHK048–CHK050 | 3/3 | 100% |
| **Total** | **50** | **49/50** | **98%** |

> CHK032 is marked `[Gap]` — no source document covers the import-while-active-flow scenario. This is an identified specification gap, not a traceability failure.

---

## Gating Status

| Gate | Items | Status |
|---|---|---|
| Cross-Slice Utilities | CHK033–CHK037 | All open — must be resolved before merge |
| Persistence Invariants | CHK038–CHK040 | All open — must be resolved before merge |
