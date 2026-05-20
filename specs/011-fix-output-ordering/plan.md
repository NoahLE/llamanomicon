# Implementation Plan: Fix Output Window Snippet Ordering

**Branch**: `011-fix-output-ordering` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/011-fix-output-ordering/spec.md`

## Summary

Three display paths (`selectSkillGroupsForOutput`, `selectSnippetsForSkill` / `selectAllSnippets` / `selectUntaggedSnippets`, and `compileOutputBySkillGroup`) call `sortByName` instead of reading from `agent.activeOrder`, making drag-and-drop reordering invisible to users. The fix replaces alphabetical sorting with `activeOrder`-index sorting in all three paths and corrects the Snippets panel drag handler to merge partial reorders into the full `activeOrder` array without losing active snippets from other skills.

No new dependencies, entities, or data fields are required.

## Technical Context

**Language/Version**: TypeScript 5.9, strict mode, `noUncheckedIndexedAccess: true`  
**Primary Dependencies**: React 19, Vite 7, Zustand 5, HeroUI, @dnd-kit/react 0.3.2, Tailwind CSS v4  
**Storage**: localStorage via Zustand `persist` middleware  
**Testing**: Vitest 4 + React Testing Library  
**Target Platform**: Browser PWA (offline-capable)  
**Project Type**: Single-page web application  
**Performance Goals**: 60 fps; no perceptible delay on local state interactions  
**Constraints**: Offline-capable; no server calls; bundle size unchanged (no new packages)  
**Scale/Scope**: Single-user local app; snippets/skills/agents in the hundreds at most

## Constitution Check

| Principle                | Check                                                                                                  | Status |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| I. Code Quality          | Fix removes `sortByName` calls (dead after fix) from ordering paths; strict types maintained; no `any` | [x]    |
| II. UX Consistency       | No new UI patterns; fix is pure logic — dark-first design unchanged                                    | [x]    |
| III. Performance         | All changes are pure selector/compiler logic; no new async, no bundle additions                        | [x]    |
| IV. Living Documentation | CLAUDE.md "Active Technologies" note updated; no new doc files needed (data model unchanged)           | [x]    |
| V. Simplicity & DRY      | `sortByActiveOrder` helper extracted only if ≥2 call-sites in same layer; each layer fixed in-place    | [x]    |
| VI. Testing Discipline   | New tests in `src/lib/tests/`, `src/store/tests/` — existing subdir convention; AAA pattern           | [x]    |
| Tech Standards           | No new libraries; dnd-kit, Zustand slices, Vitest + RTL all used correctly                             | [x]    |
| V1 Scope Gate            | Pure bug fix — no node graph, no GSAP, no neoskeumorphic design                                        | [x]    |

All gates pass. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-output-ordering/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (created by /speckit.tasks)
```

### Source Code (affected files only)

```text
src/
├── lib/
│   ├── compiler.ts                      ← fix getActiveSnippetsForSkill ordering
│   └── tests/
│       └── compiler.test.ts             ← update + add ordering tests
├── store/
│   ├── useAgents.ts                     ← fix selectSkillGroupsForOutput ordering
│   ├── useSnippets.ts                   ← fix selectAllSnippets + selectUntaggedSnippets ordering
│   ├── useSkills.ts                     ← fix selectSnippetsForSkill ordering
│   └── tests/
│       ├── useAgents.test.ts            ← add selectSkillGroupsForOutput ordering tests
│       ├── useSnippets.test.ts          ← add ordering tests
│       └── useSkills.test.ts            ← add ordering test
└── components/
    └── Snippets.tsx                     ← fix handleDragEnd partial-reorder merge
```

**Structure Decision**: Single-project layout (Option 1). No backend, no new directories. All changes are surgical edits to existing files.

## Phase 0: Research

See [research.md](research.md) for full findings. Key decisions:

1. **`activeOrder` is the display order source of truth** — no new field needed.
2. **Snippets panel display**: active snippets by `activeOrder` index, then inactive alphabetically.
3. **Partial-reorder merge algorithm** (for DnD in skill-filtered view): positional splice — replace values at positions held by visible active snippets with the new drag-determined sequence, leaving non-visible active snippets at their positions.
4. **Compiler test update**: the test asserting alphabetical ordering within a group must be updated to use `activeOrder`-based ordering.

## Phase 1: Design

### Fix 1 — `selectSkillGroupsForOutput` in `src/store/useAgents.ts`

Replace inner `getActiveSnippetsForSkill` to sort by `activeOrder` index:

```typescript
// Before (broken):
return sortByName(result);

// After (correct):
return result.sort(
  (a, b) => agent.activeOrder.indexOf(a.id) - agent.activeOrder.indexOf(b.id)
);
```

`agent` is already in scope as a closed-over variable.

### Fix 2 — `getActiveSnippetsForSkill` in `src/lib/compiler.ts`

The function receives `activeSet` and `snippetsBySkill` but not `activeOrder`. Add `activeOrder: string[]` as a parameter (passed from `agent.activeOrder` at the two call sites in `compileOutputBySkillGroup`):

```typescript
function getActiveSnippetsForSkill(
  skillId: string,
  activeOrder: string[],  // ← new parameter
  activeSet: Set<string>,
  snippets: Map<string, Snippet>,
  snippetsBySkill: Map<string, Set<string>>,
): Snippet[] {
  const ids = snippetsBySkill.get(skillId);
  if (!ids) return [];
  const result: Snippet[] = [];
  for (const id of ids) {
    if (activeSet.has(id)) {
      const snippet = snippets.get(id);
      if (snippet) result.push(snippet);
    }
  }
  // Sort by position in activeOrder instead of alphabetically
  return result.sort(
    (a, b) => activeOrder.indexOf(a.id) - activeOrder.indexOf(b.id)
  );
}
```

Update both call sites inside `compileOutputBySkillGroup` to pass `agent.activeOrder`. Also update the untagged group's sort to use `activeOrder` (currently `sortByName(untaggedSnippets)`):

```typescript
// Untagged group — sort by activeOrder instead of alphabetically
untaggedSnippets.sort(
  (a, b) => agent.activeOrder.indexOf(a.id) - agent.activeOrder.indexOf(b.id)
);
```

### Fix 3 — `selectSnippetsForSkill` in `src/store/useSkills.ts`

```typescript
export const selectSnippetsForSkill = (
  storeState: StoreState,
  skillId: string,
): Snippet[] => {
  const ids = storeState.snippetsBySkill.get(skillId);
  if (!ids) return [];
  const agent = selectActiveAgent(storeState);
  const activeOrder = agent?.activeOrder ?? [];

  const active: Snippet[] = [];
  const inactive: Snippet[] = [];

  for (const id of ids) {
    const snip = storeState.draft.snippets.get(id);
    if (!snip) continue;
    if (agent?.activeSet.has(id)) {
      active.push(snip);
    } else {
      inactive.push(snip);
    }
  }

  active.sort((a, b) => activeOrder.indexOf(a.id) - activeOrder.indexOf(b.id));
  inactive.sort((a, b) => a.name.localeCompare(b.name));

  return [...active, ...inactive];
};
```

### Fix 4 — `selectAllSnippets` and `selectUntaggedSnippets` in `src/store/useSnippets.ts`

```typescript
export const selectAllSnippets = (storeState: StoreState): Snippet[] => {
  const agent = selectActiveAgent(storeState);
  const activeOrder = agent?.activeOrder ?? [];
  const active: Snippet[] = [];
  const inactive: Snippet[] = [];
  for (const snip of storeState.draft.snippets.values()) {
    if (agent?.activeSet.has(snip.id)) {
      active.push(snip);
    } else {
      inactive.push(snip);
    }
  }
  active.sort((a, b) => activeOrder.indexOf(a.id) - activeOrder.indexOf(b.id));
  inactive.sort((a, b) => a.name.localeCompare(b.name));
  return [...active, ...inactive];
};

export const selectUntaggedSnippets = (storeState: StoreState): Snippet[] => {
  const agent = selectActiveAgent(storeState);
  const activeOrder = agent?.activeOrder ?? [];
  const active: Snippet[] = [];
  const inactive: Snippet[] = [];
  for (const snip of storeState.draft.snippets.values()) {
    if (snip.skills.size !== 0) continue;
    if (agent?.activeSet.has(snip.id)) {
      active.push(snip);
    } else {
      inactive.push(snip);
    }
  }
  active.sort((a, b) => activeOrder.indexOf(a.id) - activeOrder.indexOf(b.id));
  inactive.sort((a, b) => a.name.localeCompare(b.name));
  return [...active, ...inactive];
};
```

### Fix 5 — `handleDragEnd` in `src/components/Snippets.tsx`

Replace the naive filter with a positional-splice merge:

```typescript
function handleDragEnd({ operation }: DragEndParam) {
  if (!isSortableOperation(operation) || !activeAgent) return;
  const { source, target } = operation;
  if (!source || !target) return;
  const from = source.initialIndex;
  const to = target.index;
  if (from === to) return;

  // New visual order of all snippets in this view (active + inactive)
  const newViewIds = arrayMove(
    snippets.map((s) => s.id),
    from,
    to,
  );

  // Extract only active snippet IDs in their new view order
  const newActiveViewOrder = newViewIds.filter((id) =>
    activeAgent.activeSet.has(id),
  );

  // Positional splice: keep non-view active snippets in their existing
  // activeOrder positions; replace positions of view-active snippets
  // with the new drag-determined sequence.
  const currentActiveOrder = activeAgent.activeOrder;
  const viewActiveSet = new Set(newActiveViewOrder);

  // Positions in activeOrder currently occupied by visible active snippets
  const positions: number[] = [];
  for (let i = 0; i < currentActiveOrder.length; i++) {
    const id = currentActiveOrder[i];
    if (id !== undefined && viewActiveSet.has(id)) {
      positions.push(i);
    }
  }

  const newActiveOrder = [...currentActiveOrder];
  positions.forEach((pos, idx) => {
    const id = newActiveViewOrder[idx];
    if (id !== undefined) newActiveOrder[pos] = id;
  });

  reorderSnippets(activeAgent.id, newActiveOrder);
}
```

---

## Post-Design Constitution Re-Check

All principles satisfied:

- **I. Code Quality**: `sortByName` is still used in `selectSortedAgents`, `selectSortedSkills`, and `sortByName(remaining)` for skill group ordering — those are intentionally alphabetical. Only the per-snippet ordering within groups is changed. Dead imports/exports checked: none introduced.
- **V. Simplicity & DRY**: The `indexOf`-based sort appears in four places (compiler + three selectors). If a fifth emerges, extract a shared helper. Not premature at four.
- **VI. Testing**: All new tests follow `tests/` subdir, AAA pattern, and use store actions for setup (not raw object construction).
