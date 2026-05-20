# Research: Fix Output Window Snippet Ordering

**Feature**: 011-fix-output-ordering  
**Date**: 2026-04-28

---

## Decision 1: Source of truth for snippet display order within a skill group

**Decision**: `agent.activeOrder` is the authoritative order for snippets within every skill group in the Output window and within every skill-filtered view in the Snippets panel.

**Rationale**: `activeOrder` already exists on the Agent entity as an ordered array of active snippet IDs (`activeOrder: string[]`). It is updated by `reorderSnippets` on every drag-and-drop. No new data field is needed. The only bug is that three places call `sortByName` instead of reading from `activeOrder`.

**Alternatives considered**:
- Per-skill ordering (e.g., `skillSnippetOrder: Map<skillId, string[]>` on Agent) — rejected because it duplicates ordering data for multi-skill snippets and introduces sync complexity.
- Global snippet ordering independent of agents — rejected because ordering is per-agent by design; different agents may activate and prioritise the same snippets differently.

---

## Decision 2: How `selectSnippetsForSkill` / `selectAllSnippets` should order snippets

**Decision**: When an agent is active, selectors return active snippets in their `activeOrder`-relative sequence followed by inactive snippets sorted alphabetically. When no agent is active, fall back to fully alphabetical ordering.

**Rationale**: The Snippets panel is the drag-and-drop canvas. After a drag, the panel must immediately reflect the new order to give the user visual feedback. Active snippets appear first in their agent-defined order; inactive snippets remain discoverable in a stable, predictable alphabetical tail.

**Alternatives considered**:
- All snippets alphabetical always — the current broken state; drag-and-drop has no visual effect.
- Active snippets first by `activeOrder`, inactive snippets interleaved by original insertion position — rejected because insertion order from a `Map` is not a meaningful UI sort key.

---

## Decision 3: How to apply a partial reorder (visible-skill-filtered drag) to the full `activeOrder`

**Decision**: Use a "positional splice" algorithm. The positions occupied by the currently-visible active snippets within `activeOrder` are preserved; only the values at those positions are replaced with the new drag-determined order.

**Example**:
```
activeOrder before: [X1, A, X2, C, X3]  (X = snippets from other skills)
Visible active snippets for current skill: [A, C]
User drags A to after C → new visible order: [C, A]
positions of A and C in activeOrder: [1, 3]
activeOrder after:  [X1, C, X2, A, X3]
```

**Rationale**: This preserves the relative ordering of active snippets from skills not currently visible. Inserting a moved snippet at a single point in `activeOrder` would shift many unrelated snippets' positions, potentially reordering other skill groups unexpectedly.

**Alternatives considered**:
- Flatten and rebuild `activeOrder` by concatenating skill groups in order — rejected because it introduces coupling between the drag handler and skill group knowledge.
- Pass full `activeOrder` to `reorderSnippets` by reconstructing it in the component — this is exactly what the positional splice produces; the component computes the correct full array and passes it to the existing store action unchanged.

---

## Decision 4: What to change in `compileOutputBySkillGroup` (compiler.ts)

**Decision**: Pass `agent.activeOrder` into `getActiveSnippetsForSkill` so that active snippets within a skill group are emitted in `activeOrder`-relative sequence. The function already has access to `agent`; add `activeOrder` as a closed-over variable in the local function.

**Rationale**: `compileOutputBySkillGroup` is a pure function used for the text copy output. It must stay in sync with `selectSkillGroupsForOutput`. Both use the same ordering rule: within a group, emit snippets in `activeOrder` position order.

**Alternatives considered**:
- Deduplicate the ordering logic into a shared helper — would satisfy rule-of-three (two call-sites: compiler + selector), but the helper is trivially small (one `sort` call using indexOf). Extract only if a third call-site appears.

---

## Decision 5: Compiler tests that assert alphabetical ordering within groups

**Decision**: The existing test "single group emits all active snippets alphabetically by name" must be updated. Because `activeOrder` is now the ordering mechanism, the test must set `activeOrder` to express the desired order, and the description must be updated to reflect `activeOrder`-based ordering.

**Rationale**: The test was written against the (incorrect) alphabetical behaviour. Keeping it as-is would require the bug to persist to pass CI. The test's semantic intent is "snippets within a group appear in the correct order" — updating the fixture to use `activeOrder` preserves the intent with the correct implementation.

**Alternatives considered**:
- Add a new test alongside the old — rejected because the old test asserts wrong behaviour and would fail after the fix.

---

## Impacted Files (complete list)

| File | Change |
|------|--------|
| `src/lib/compiler.ts` | `getActiveSnippetsForSkill`: replace `sortByName` with sort-by-`activeOrder`-index |
| `src/store/useAgents.ts` | `selectSkillGroupsForOutput` > inner `getActiveSnippetsForSkill`: same fix |
| `src/store/useSnippets.ts` | `selectAllSnippets`, `selectUntaggedSnippets`: order active by `activeOrder`, then inactive alphabetically |
| `src/store/useSkills.ts` | `selectSnippetsForSkill`: same as useSnippets selectors |
| `src/components/Snippets.tsx` | `handleDragEnd`: replace naive filter with positional-splice to build correct full `activeOrder` |
| `src/lib/tests/compiler.test.ts` | Update alphabetical-ordering test to use `activeOrder`; add ordering tests |
| `src/store/tests/useAgents.test.ts` | Add `selectSkillGroupsForOutput` ordering tests |
| `src/store/tests/useSnippets.test.ts` | Add ordering tests for `selectAllSnippets`, `selectUntaggedSnippets` |
| `src/store/tests/useSkills.test.ts` | Add ordering test for `selectSnippetsForSkill` |

No new dependencies. No new data model fields. No new components.
