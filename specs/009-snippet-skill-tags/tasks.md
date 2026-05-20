# Tasks: Snippet Skill Assignment

**Input**: Design documents from `/specs/009-snippet-skill-tags/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature can be built without new dependencies or config changes.

- [X] T001 Confirm `TagGroup` and `Tag` are exported from `@heroui/react` and no new packages are needed — check existing imports in `src/components/AppFormFieldGenerator.tsx` and run `make install` if needed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type and store changes that MUST be complete before any user story work can begin.

**⚠️ CRITICAL**: T002 and T003 can run in parallel (different files). All Phase 3+ work blocks on both.

- [X] T002 [P] Extend `FormField` interface in `src/lib/formFields.ts` — add `"taggroup"` to the `type` union (`"text" | "textarea" | "taggroup"`) and add optional `options?: Array<{ id: string; label: string }>` property; all existing `FormField[]` arrays require zero changes because the property is optional
- [X] T003 [P] Extend `addSnippet` in `src/store/useSnippets.ts` — add optional third parameter `skills?: Set<string>` (default `new Set<string>()`) to the action implementation and the `SnippetsSlice` interface; inside the `set()` call, iterate over `skills` and call `addToSetIndex(snippetsBySkill, skillId, snippet.id)` for each ID so the derived index is updated atomically

**Checkpoint**: `FormField` type extended and `addSnippet` signature updated — user story work can now begin

---

## Phase 3: User Story 1 — Assign Skills When Adding a Snippet (Priority: P1) 🎯 MVP

**Goal**: The Add Snippet modal shows a multi-select tag group of all available skills; the snippet is saved with the selected skills assigned atomically.

**Independent Test**: Open the Add Snippet modal, select two skills from the tag group, save, then switch to each of those skills in the Skills panel and confirm the snippet appears.

- [X] T004 [US1] Add `"taggroup"` case to the renderer switch in `src/components/AppFormFieldGenerator.tsx` — derive `selectedKeys` as `new Set(value ? value.split(",").filter(Boolean) : [])`, render `<TagGroup selectionMode="multiple" selectedKeys={selectedKeys} onSelectionChange={...}>` with `<Tag key={opt.id} id={opt.id}>` children from `field.options ?? []`; in `onSelectionChange`, handle `keys === "all"` by mapping all option IDs, otherwise spread keys cast to `string[]`, then call `onChange(field.key, ids.join(","))`
- [X] T005 [US1] Extend `src/components/Snippets.tsx` for the add flow — subscribe to `selectSortedSkills` via `useAppStore(useShallow(selectSortedSkills))`, map to `skillOptions: Array<{ id: string; label: string }>` (no filtering needed since `UNTAGGED_SKILL_ID` is not a stored skill); construct `snippetFields: FormField[]` by spreading the existing `snippetFormFields` and appending `{ key: "skills", label: "Skills", type: "taggroup", options: skillOptions }`; update the add modal's `onSave` to parse `v.skills` into `const skillIds = new Set((v.skills ?? "").split(",").filter(Boolean))` and call `addSnippet(v.name, v.text, skillIds)`

**Checkpoint**: Add Snippet modal shows tag group; saving with selections assigns skills; saving with no selections saves snippet with empty skills set (appears under Untagged)

---

## Phase 4: User Story 2 — Edit Skill Assignments on an Existing Snippet (Priority: P1)

**Goal**: The Edit Snippet modal pre-selects the snippet's current skills; saving applies the diff via `addTag`/`removeTag` calls.

**Independent Test**: Open the edit modal for a snippet assigned to Skill A. Deselect Skill A, select Skill B, save. Confirm the snippet no longer appears under Skill A and now appears under Skill B.

- [X] T006 [US2] Extend `src/components/Snippets.tsx` for the edit flow — add `initialValues={{ name: snippet.name, text: snippet.text, skills: [...snippet.skills].join(",") }}` to the edit modal so current assignments are pre-selected; implement the edit `onSave` handler: call `updateSnippet(snippet.id, { name: v.name ?? "", text: v.text ?? "" })`; compute `newSkillIds = new Set((v.skills ?? "").split(",").filter(Boolean))`; iterate `newSkillIds` and call `addTag(snippet.id, id)` for each ID not in `snippet.skills`; iterate `snippet.skills` and call `removeTag(snippet.id, id)` for each ID not in `newSkillIds`

**Checkpoint**: Edit modal pre-selects existing skill assignments; saving correctly adds new skills and removes deselected skills; canceling leaves assignments unchanged

---

## Phase 5: User Story 3 — Deferred Visibility Until Save (Priority: P2)

**Goal**: Confirm that skill assignment changes in an open modal are invisible to the rest of the UI until `onSave` fires — no additional code required; this is an architectural property of `AppFormModal`.

**Independent Test**: Open the edit modal, change skill selections without saving, confirm the Skills panel shows the pre-edit membership. Save and confirm the panel updates immediately.

- [X] T007 [US3] Validate deferred update behavior in `src/components/Snippets.tsx` — confirm `AppFormModal` manages `values.skills` in local `useState` and does NOT call any store action until the save button is pressed; review that the `onSave` handlers implemented in T005 and T006 are the only store-mutating calls; verify against FR-004 and US3 acceptance scenarios; no new code required

**Checkpoint**: All three user stories are now fully implemented and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all changed files.

- [X] T008 Run `make lint` and fix any TypeScript strict-mode issues (`noUncheckedIndexedAccess: true`) introduced across `src/lib/formFields.ts`, `src/store/useSnippets.ts`, `src/components/AppFormFieldGenerator.tsx`, and `src/components/Snippets.tsx`
- [X] T009 [P] Run `make build` to confirm the production type-check passes with zero errors
- [ ] T010 [P] Validate the full quickstart.md scenario: create skills, add a snippet with tags, edit tags, test deferred update, test cancel discards changes, test no-skills → Untagged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user story phases; T002 and T003 run in parallel
- **User Story 1 (Phase 3)**: Depends on T002 and T003 — T004 and T005 run sequentially (both touch `Snippets.tsx`)
- **User Story 2 (Phase 4)**: Depends on Phase 3 — T006 extends `Snippets.tsx` work from T005
- **User Story 3 (Phase 5)**: Depends on Phase 4 — T007 is a verification task
- **Polish (Phase 6)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T002 + T003)
- **US2 (P1)**: Depends on US1 (same file — `Snippets.tsx`; edit flow builds on add flow structure)
- **US3 (P2)**: Depends on US2 (architectural verification; no code to write)

### Within Each User Story

- `AppFormFieldGenerator.tsx` change (T004) can be developed in isolation from `Snippets.tsx` changes (T005) — different files
- T005 and T006 are sequential — both modify `Snippets.tsx`, T006 extends the edit modal that T005's field construction feeds into

### Parallel Opportunities

- **T002 + T003** (Phase 2): Different files (`formFields.ts` vs `useSnippets.ts`) — fully parallel
- **T004 + T005** (Phase 3): T004 touches only `AppFormFieldGenerator.tsx`; T005 touches only `Snippets.tsx` — parallel until T005 needs T004's rendered output
- **T009 + T010** (Phase 6): Independent validation tasks — parallel

---

## Parallel Example: Phase 2 (Foundational)

```
# Launch both foundational tasks together:
Task T002: "Extend FormField interface in src/lib/formFields.ts"
Task T003: "Extend addSnippet in src/store/useSnippets.ts"
# Both touch different files — no conflict
```

## Parallel Example: Phase 3 (User Story 1)

```
# T004 can begin as soon as T002 completes (needs the FormField type):
Task T004: "Add taggroup case to src/components/AppFormFieldGenerator.tsx"

# T005 can begin as soon as T002 + T003 complete:
Task T005: "Extend src/components/Snippets.tsx for add flow"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify deps)
2. Complete Phase 2: Foundational (T002 + T003 in parallel)
3. Complete Phase 3: User Story 1 (T004 → T005)
4. **STOP and VALIDATE**: Open Add Snippet modal, select skills, save, confirm Skills panel — done
5. Deliver if ready

### Incremental Delivery

1. Setup + Foundational → type system + store ready
2. US1 → Add modal has tag group → **MVP demo: snippets can be tagged at creation**
3. US2 → Edit modal has tag group with pre-selection → **Full CRUD for skill assignment**
4. US3 → Architectural verification → **Deferred-update behavior confirmed**
5. Polish → Lint, build, quickstart validation

---

## Notes

- [P] tasks = different files, no data dependencies — safe to run concurrently
- US3 requires no new code — it is a correctness property of `AppFormModal`'s existing `useState` isolation
- `UNTAGGED_SKILL_ID` never appears in `state.draft.skills`, so no filtering is needed when building the `options` array from `selectSortedSkills`
- The `options` property on `FormField` is optional — all existing `FormField[]` arrays (`agentFormFields`, `skillFormFields`, `snippetFormFields`) compile without changes
- Comma-separated string encoding (`"id1,id2"`) is the form-layer boundary; the store always receives and returns `Set<string>`
- Commit after each phase checkpoint to keep rollback granular
