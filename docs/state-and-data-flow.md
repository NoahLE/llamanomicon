# State and Data Flow

This document is a detailed reference for the store. For a higher-level overview of how the store fits into the app, see `docs/architecture.md`.

## Store Composition

All slices are composed into a single Zustand store in `src/store/useAppStore.ts`. The root store owns three top-level fields that are shared across slices:

```ts
baseline: DataState; // last saved snapshot (persisted)
agents: Map<string, Agent>; // live session state (ephemeral)
snippets: Map<string, Snippet>; // live session state (ephemeral)
skills: Map<string, Skill>; // live session state (ephemeral)
snippetsBySkill: Map<string, Set<string>>; // derived index (ephemeral)
```

`DataState` is `{ snippets: Map<string, Snippet>, skills: Map<string, Skill>, agents: Map<string, Agent> }`.

Components import `useAppStore` (with selectors attached) or `useAppStoreBase` (raw). All selectors read from the live session state.

## Store Slices

| File                    | Exports                                                                                                                    | Key actions                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `useAppStore.ts`        | `useAppStore`, `useAppStoreBase`, `StoreState`                                                                             | Compose slices; own persist + immer middleware; `createSelectors()` for `.use` accessors      |
| `useSnippets.ts`        | `createSnippetsSlice`, `selectAllSnippets`, `selectUntaggedSnippets`, `selectSnippetsForSkill`                             | `addSnippet`, `updateSnippet`, `deleteSnippet`, `addSkillToSnippet`, `removeSkillFromSnippet` |
| `useSkills.ts`          | `createSkillsSlice`, `selectSortedSkills`, `selectSnippetCountForSkill`, `selectUntaggedSnippetCount`, `UNTAGGED_SKILL_ID` | `addSkill`, `updateSkill`, `deleteSkill`, `setActiveSkillId`                                  |
| `useAgents.ts`          | `createAgentsSlice`, `selectActiveAgent`, `selectSortedAgents`, `selectSkillGroupsForOutput`                               | `addAgent`, `updateAgent`, `deleteAgent`, `setActiveAgentId`                                  |
| `useAgentSnippets.ts`   | `createAgentsSnippetsSlice`                                                                                                | `activateSnippet`, `deactivateSnippet`                                                        |
| `useSettings.ts`        | `createSettingsSlice`, `selectCompiledOutput`, `selectCompiledOutputXML`                                                   | `updateOutputSettings`                                                                        |
| `useDataControls.ts`    | `createDataControlsSlice`                                                                                                  | `saveSession`, `discardSession`, `clearData`, `importState`, `rebuildIndex`, `seedData`       |
| `src/lib/indexUtils.ts` | helpers                                                                                                                    | `addToSetIndex`, `removeFromSetIndex`                                                         |
| `src/lib/storeUtils.ts` | `UNTAGGED_SKILL_ID`, `sortByName`, `buildSnippetsBySkill`                                                                  | (utilities — no slice state)                                                                  |

## Session / Baseline Model

| Action                  | Effect                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Any CRUD mutation       | Applied to live session state only                                                              |
| `saveSession()`         | `baseline = structuredClone(session)` → triggers persist to localStorage                        |
| `discardSession()`      | Live session state = `structuredClone(baseline)` + rebuilds `snippetsBySkill`                   |
| App hydration           | Live session state = `structuredClone(baseline)` + `rebuildIndex()`                             |
| `importState(appState)` | Replaces both `baseline` and live session state; resets `activeAgentId`/`activeSkillId` to null |

## Persistence

Zustand `persist` middleware writes to `localStorage` key `llamanomicon-v2`.

**What is persisted** (via `partialize`):

- `baseline` — the full `DataState` (snippets, skills, agents maps)
- `outputSettings` — `{ theme }` (HeroUI theme)

**What is NOT persisted:**

- Live maps (`agents`, `snippets`, `skills`) — rebuilt from `baseline` on hydration
- `snippetsBySkill` — rebuilt from live snippets on hydration
- `activeAgentId`, `activeSkillId` — session-only UI state

**Map/Set serialization:** `Map` and `Set` are not JSON-native. The store uses custom `replacer` / `reviver` functions from `src/lib/serialization.ts` that encode them as tagged plain objects during `JSON.stringify` / `JSON.parse`.

## Import / Export

Handled by `src/lib/importExport.ts`. The exchange format is `AppState` (see `src/types/index.ts`):

```ts
interface AppState {
  snippets: Record<string, SerializedSnippet>; // skills: string[] (not Set)
  skills: Record<string, SerializedSkill>;
  agents: Record<string, SerializedAgent>; // activeSet: string[] (not Set)
  outputSettings: OutputSettings;
}
```

- `exportState()` — serializes live session state + `outputSettings` → date-stamped JSON file. Uses File System Access API; falls back to a `<a download>` link.
- `importStateFromFile()` — user picks a JSON file → `validateAppState()` checks structure → `importState()` deserializes arrays back to Sets/Maps and replaces both `baseline` and live session state.

Import is **replace-not-merge**: existing state is fully overwritten.

## Count Selectors

`selectSnippetCountForSkill(state, skillId): { active: number; total: number }` — derives the active/total snippet count for a named skill. `total` is `snippetsBySkill.get(skillId)?.size ?? 0`; `active` counts how many of those IDs are in `activeAgent.activeSet`. Returns `{ active: 0, total }` when no agent is selected.

`selectUntaggedSnippetCount(state): { active: number; total: number }` — same shape for the virtual "Untagged" row. Iterates `state.snippets` filtering for entries where `skills.size === 0`.

Both selectors are exported from `useSkills.ts` and call `selectActiveAgent` (imported from `useAgents.ts`) — the same cross-slice pattern used by `selectCompiledOutput` in `useSettings.ts`. Use `useShallow` at every call site since both return objects.

```typescript
// SkillsListItem.tsx
const count = useAppStore(
  useShallow((state) => selectSnippetCountForSkill(state, skill.id)),
);

// SkillsList.tsx (Untagged row)
const untaggedCount = useAppStore(useShallow(selectUntaggedSnippetCount));
```

## snippetsBySkill Index

`snippetsBySkill: Map<skillId, Set<snippetId>>` is the inverse of `snippet.skills`. It is always derived from the live session snippets.

Built by `buildSnippetsBySkill()` exported from `src/lib/storeUtils.ts`. Updated incrementally (not rebuilt from scratch) on:

- `addTag` / `removeTag` — via `addToSetIndex` / `removeFromSetIndex` from `indexUtils.ts`
- `deleteSnippet` — removes all skill entries for the deleted snippet
- `deleteSkill` — removes the skill key entirely
- `discardSession` / `importState` / `seedData` — full rebuild

## Output Compiler

`src/lib/compiler.ts` exports pure functions, no side effects:

### `buildSkillGroups` (shared building block)

```ts
buildSkillGroups(
  agent: Agent,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
): SkillGroup[]
```

Builds an ordered `SkillGroup[]`. Order: all skills with ≥1 active snippet, sorted alphabetically → Untagged last. Snippets within each group sorted alphabetically by name. Used by both `compileOutputBySkillGroup` and `compileOutputXML`.

### `compileOutputBySkillGroup` (active output path)

Called by `selectCompiledOutput` in `useSettings.ts`. Produces the text copied to the clipboard.

```ts
compileOutputBySkillGroup(
  agent: Agent | null,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
): string
```

**Algorithm**:

1. Call `buildSkillGroups` to get the ordered `SkillGroup[]`.
2. Track `seen: Set<string>`. Iterate groups; within each group iterate snippets in order.
3. Skip any snippet ID already in `seen`; otherwise emit its text and add to `seen`.
4. Join emitted texts with `"\n"` and trim.

Multi-skill snippets are therefore emitted exactly once at their first-matching-group position.

### `compileOutputXML` (XML output path)

Called by `selectCompiledOutputXML` in `useSettings.ts`. Produces the XML-formatted output shown in Raw Output when XML mode is selected.

```ts
compileOutputXML(
  agent: Agent | null,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
): string
```

**Algorithm**: same ordering and deduplication as `compileOutputBySkillGroup`, but wraps each skill group in `<tagName>` XML tags (skill name converted to a valid XML tag slug) with each snippet's text prefixed by `• `. Groups are joined with `"\n\n"`.
