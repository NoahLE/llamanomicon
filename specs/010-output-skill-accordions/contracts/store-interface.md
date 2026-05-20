# Store Interface Contracts: Output Skill Accordions

**Branch**: `010-output-skill-accordions`  
**Date**: 2026-04-24  
**Revision**: Within-group order is alphabetical; `activeOrder` removed from output path

---

## New Store Action: `reorderSkillGroups`

**Slice**: `useAgents.ts` (`AgentsSlice`)

```ts
reorderSkillGroups: (agentId: string, newOrder: string[]) => void
```

| Parameter  | Type       | Description                                                          |
| ---------- | ---------- | -------------------------------------------------------------------- |
| `agentId`  | `string`   | ID of the agent whose group order is being updated                   |
| `newOrder` | `string[]` | Full ordered array of skill IDs in the user's new preferred order    |

**Preconditions**: `agentId` must exist in session agents.  
**Effect**: Sets `agents[agentId].skillGroupOrder = newOrder`. No other fields modified.  
**State participation**: Session only; committed via `saveSession()`, reverted via `discardSession()`.

---

## New Selector: `selectSkillGroupsForOutput`

**File**: `src/store/useAgents.ts`

```ts
selectSkillGroupsForOutput: (storeState: StoreState) => SkillGroup[]
```

**Returns**: Ordered `SkillGroup[]` for the active agent. Empty array if no active agent or no active snippets.

**Group ordering**:
1. Skills in `agent.skillGroupOrder` with ≥1 active snippet, in array order
2. Skills with ≥1 active snippet not in `skillGroupOrder`, alphabetical by skill name
3. `UNTAGGED_SKILL_ID` group if any active untagged snippets exist (always last)

**Snippet ordering within each group**: alphabetical by snippet name — same as `selectSnippetsForSkill`, filtered to `agent.activeSet`.

**SkillGroup shape**:
```ts
interface SkillGroup {
  skillId: string;      // skill UUID or UNTAGGED_SKILL_ID
  skillName: string;    // skill.name or "Untagged"
  snippets: Snippet[];  // active snippets, sorted alphabetically (may appear in multiple groups for multi-skill)
}
```

---

## Modified Selector: `selectCompiledOutput`

**File**: `src/store/useSettings.ts`

Signature unchanged — returns `string`. Internally delegates to `compileOutputBySkillGroup` instead of `compileOutput`.

**Compilation contract**:
- Output order follows `selectSkillGroupsForOutput` group order.
- Within each group, snippet order is alphabetical by name.
- A snippet tagged to multiple skills is emitted at the position of its first group encounter (first-group wins).
- `settings.snippetSeparator` joins snippets.
- `activeOrder` is NOT consulted.

---

## New Compiler Function: `compileOutputBySkillGroup`

**File**: `src/lib/compiler.ts`

```ts
export function compileOutputBySkillGroup(
  agent: Agent,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
  settings: OutputSettings,
): string
```

**Algorithm**:
1. Build ordered groups (same logic as `selectSkillGroupsForOutput`)
2. Iterate groups; within each, iterate alphabetically-sorted active snippets
3. Track `seen: Set<string>`; skip already-emitted snippet IDs
4. Join emitted texts with `settings.snippetSeparator`; trim

The existing `compileOutput` function is **retained unchanged** for backward compatibility with existing tests.

---

## Cascade: `deleteSkill` update

**File**: `src/store/useSkills.ts`

Existing `deleteSkill` already cascades to `snippetsBySkill` and snippet `skills` Sets. It must additionally:

```ts
// Remove deleted skillId from every agent's skillGroupOrder
for (const [agentId, agent] of storeState.draft.agents) {
  if (agent.skillGroupOrder.includes(deletedSkillId)) {
    agents.set(agentId, {
      ...agent,
      skillGroupOrder: agent.skillGroupOrder.filter(id => id !== deletedSkillId),
    });
  }
}
```
