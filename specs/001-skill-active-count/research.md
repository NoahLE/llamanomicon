# Research: Skill Active Snippet Count

**Branch**: `001-skill-active-count` | **Date**: 2026-04-21 _(updated for store refactor — selectors.ts removed)_

## Findings

### 1. Existing State Structure

**Decision**: Use `snippetsBySkill: Map<string, Set<string>>` (skillId → snippet IDs) combined with `activeAgent.activeSet: Set<string>` to compute counts.

**Rationale**: Both structures already exist in the store. `snippetsBySkill` is a maintained inverse index rebuilt on hydration and kept in sync on all tag mutations (`addTag`, `removeTag`, cascade deletes). `activeSet` is a `Set<string>` with O(1) `.has()` lookups. Intersection cost is O(total snippets for the skill) — negligible at V1 scale.

**Alternatives considered**: Storing counts as persisted data on the Skill entity. Rejected: counts are fully derivable from existing state; persisted counts would require careful sync on every activation/deactivation/delete and violate the derived-index contract already established for `snippetsBySkill`.

---

### 2. Selector Strategy

**Decision**: Two new pure selector functions — placed in their owning slice files per the merged store refactor that eliminated `src/store/selectors.ts`:

- `selectSnippetCountForSkill(state, skillId): { active: number; total: number }` → `src/store/useSkills.ts`
- `selectUntaggedSnippetCount(state): { active: number; total: number }` → `src/store/useSnippets.ts`

**Rationale**: The `006-inline-selectors` merge removed the centralised `selectors.ts` and co-located every selector in its owning slice file. `selectSnippetCountForSkill` is skill-domain derived state (uses `snippetsBySkill`); `selectUntaggedSnippetCount` is snippet-domain derived state (filters `draft.snippets`). Both selectors call `selectActiveAgent` (imported from `useAgents.ts`), which matches the pattern used by `selectCompiledOutput` in `useSettings.ts`. Pure functions are trivially testable.

**Alternatives considered**:
- Keeping a centralised `selectors.ts`. Rejected: the file was deleted by the merged refactor; recreating it would immediately conflict with the established pattern.
- Precompute a `Map<skillId, counts>` for all skills in one selector called from `SkillsList` and passed down as props. Rejected: increases prop coupling; each `SkillsListItem` already independently subscribes to store state.
- Inline computation inside components without a named selector. Rejected: untestable, violates single-responsibility.

---

### 3. Component Subscription Pattern

**Decision**: Each `SkillsListItem` subscribes via:
```typescript
const count = useAppStore(
  useShallow((state) => selectSnippetCountForSkill(state, skill.id))
);
```
The Untagged row in `SkillsList` subscribes via:
```typescript
const untaggedCount = useAppStore(useShallow(selectUntaggedSnippetCount));
```

**Rationale**: `useShallow` is required because the selector returns an object `{ active, total }`. Without it, every render would trigger a re-render regardless of value equality (object identity changes each call). `useShallow` performs a shallow equality check on the returned object's fields, which is correct for `{ active: number; total: number }`.

**Alternatives considered**: Returning `[active, total]` as a tuple. Rejected: object with named fields is more readable and consistent with the codebase's selector return style.

---

### 4. Display Format

**Decision**: Render the count as `(active/total)` in a `<span>` with `text-xs text-muted shrink-0` styling, placed after the skill name `<span>` in the existing flex row.

**Rationale**: The format matches the user's specification example exactly. `text-xs text-muted` is already used throughout the panel for secondary information, maintaining UX consistency (Constitution Principle II). `shrink-0` prevents the count from collapsing when skill names are long.

**Alternatives considered**: Progress bar or badge. Rejected: V1 scope gate requires minimal UI additions; text is sufficient and already in use for similar contexts.

---

### 5. No-Agent State

**Decision**: When `activeAgentId` is null, the active count is 0 for all skills.

**Rationale**: Without a selected agent there is no active set, so 0 active is the correct and unambiguous value. The total still reflects the actual snippet count tagged to the skill.

---

### 6. Testing Approach

**Decision**:
- `src/store/tests/useSkills.test.ts` — append tests for `selectSnippetCountForSkill` covering: no-agent (active=0), agent with 0 active, partial active, all active, skill with zero tagged snippets (0/0).
- `src/store/tests/useSnippets.test.ts` — append tests for `selectUntaggedSnippetCount` covering: no-agent, all snippets tagged (total=0), mix of tagged/untagged, partial active.
- `src/components/tests/SkillsListItem.test.tsx` — new file; tests verify count string renders correctly and updates on store changes.

**Rationale**: Constitution VI requires test files to match source file names. There is no `selectors.ts`, so `selectors.test.ts` must not be created. Tests append to the existing slice test files where the selectors now live. Both use native store actions to set up state (Constitution Principle VI: native mechanisms first).
