# Quickstart: Output Skill Accordions

**Branch**: `010-output-skill-accordions`  
**Date**: 2026-04-24  
**Revision**: Snippet order = alphabetical within skill group (matches skill window); `activeOrder` not used in output path

---

## What This Feature Changes

The Output Window's flat compiled-text block is replaced with a skill-grouped accordion layout. Each skill with active snippets gets a collapsible section. Within each section, snippets appear alphabetically — the same order as the SnippetsPanel when that skill is selected. Skill group sections can be drag-reordered to control the overall output structure. The Copy button still compiles and copies plain text.

**`activeOrder` is no longer consulted for output compilation.** It remains on the Agent type and is still maintained by activation/deactivation/reorder actions, but the output path bypasses it entirely in favour of alphabetical within-group order.

---

## Files to Touch (in order)

### 1. Types

**`src/types/Agent.ts`**  
Add `skillGroupOrder: string[]` to the `Agent` interface.

**`src/types/index.ts`**  
Add `skillGroupOrder: string[]` to `SerializedAgent`.

---

### 2. Store

**`src/store/useDataControls.ts`**  
In `importState`: default missing `skillGroupOrder` to `[]` for backward compatibility with existing localStorage data.

**`src/store/useAgents.ts`**

- Initialize `skillGroupOrder: []` in the `repo.create` call inside `addAgent`.
- Add `reorderSkillGroups(agentId: string, newOrder: string[])` action.
- Add `selectSkillGroupsForOutput(state): SkillGroup[]` selector.

**`src/store/useSkills.ts`**  
In `deleteSkill`: add cascade to remove the deleted skill ID from `skillGroupOrder` on every agent.

---

### 3. Compiler

**`src/lib/compiler.ts`**  
Add `compileOutputBySkillGroup(agent, snippets, skills, snippetsBySkill, settings)`. Keep `compileOutput` intact.

**`src/store/useSettings.ts`**  
Update `selectCompiledOutput` to call `compileOutputBySkillGroup`, passing `storeState.snippetsBySkill` and `storeState.draft.skills`.

---

### 4. UI

**`src/components/SkillGroupAccordion.tsx`** _(new file)_  
One draggable `Accordion.Item` for a `SkillGroup`. Uses `useSortable({ id, index })`. Lists snippets alphabetically in the body (read-only — no drag within the group).

**`src/components/OutputWindow.tsx`** _(refactored)_  
- Remove `<pre>` block and `selectCompiledOutput` direct text rendering.
- Add `DragDropProvider` + `Accordion.Root` driven by `selectSkillGroupsForOutput`.
- Copy button continues to call `copy(selectCompiledOutput(state))` — already uses the selector.

---

### 5. Tests

**`src/store/tests/useAgents.test.ts`**  
- `reorderSkillGroups` happy path and no-op (same order).
- `deleteSkill` cascade removes from `skillGroupOrder`.

**`src/lib/tests/compiler.test.ts`** _(new file)_  
- `compileOutputBySkillGroup`: single group, multiple groups in order, multi-skill dedup (first-group wins), empty agent, alphabetical within-group.

**`src/components/tests/OutputWindow.test.tsx`** _(new file)_  
- Correct number of accordion sections rendered.
- Empty-state messages.
- Copy button disabled when no active snippets.

---

### 6. Documentation

**`CLAUDE.md`**  
- Add `skillGroupOrder` to Agent description.
- Add `reorderSkillGroups` and `selectSkillGroupsForOutput` to store slice notes.
- Update OutputWindow description in UI Layout section.

**`docs/models.md`**  
- Add `skillGroupOrder` to Agent type definition table.

**`docs/state-and-data-flow.md`**  
- Update compiler section: `compileOutputBySkillGroup` replaces `compileOutput` in the output path.

---

## Key Invariants to Preserve

| Invariant                                          | How to verify                                              |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `activeSet` and `activeOrder` stay in sync         | Existing store tests; do not modify activation actions     |
| Each active snippet emitted exactly once           | `compileOutputBySkillGroup` unit tests with multi-skill    |
| `skillGroupOrder` participates in session          | Discard session → order reverts test                       |
| Old localStorage data loads without error          | `importState` defaults missing `skillGroupOrder` to `[]`   |
| Within-group order matches SnippetsPanel           | Alphabetical via `sortByName` — same function used in both |

---

## Dev Server Verification

```bash
make dev   # http://localhost:5173
```

Golden path:
1. Select an agent.
2. Create snippets tagged to at least two different skills.
3. Activate several snippets across the skills.
4. Verify Output Window shows skill-labeled accordion sections, all expanded.
5. Verify snippets within each section appear alphabetically (same as SnippetsPanel order).
6. Drag one section to a new position.
7. Click Copy — verify clipboard text reflects new group order with alphabetical snippets within each group.
8. Click Discard — verify sections revert to previous order.
