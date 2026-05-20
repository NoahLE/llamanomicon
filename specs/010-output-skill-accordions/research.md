# Research: Output Skill Accordions

**Branch**: `010-output-skill-accordions`  
**Date**: 2026-04-24  
**Revision**: Updated to reflect user direction — snippet order replaced by skill order

---

## Decision 1: Accordion Component — HeroUI Accordion

**Decision**: Use `Accordion` from `@heroui/react` (already in the dependency tree).

**API surface needed**:
```tsx
<Accordion.Root
  allowsMultipleExpanded   // allow all sections open simultaneously
  defaultExpandedKeys={new Set(allSkillIds)}  // all expanded on mount
>
  <Accordion.Item id={skillId}>
    <Accordion.Heading>
      <Accordion.Trigger>{skillName}</Accordion.Trigger>
    </Accordion.Heading>
    <Accordion.Panel>
      <Accordion.Body>{snippets}</Accordion.Body>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

- `defaultExpandedKeys` (uncontrolled) is sufficient — collapsed state is session-local and not persisted.
- `allowsMultipleExpanded` must be set; default is single-open-at-a-time.

**Rationale**: No new dependency. HeroUI Accordion is already bundled with `@heroui/react`.  
**Alternatives considered**: `@radix-ui/react-accordion` (would add a dependency), custom `<details>/<summary>` (not visually consistent).

---

## Decision 2: Drag-and-Drop — Existing dnd-kit Pattern

**Decision**: Mirror the `SnippetItem` / `Snippets` drag pattern exactly: `DragDropProvider` wraps the accordion list; `useSortable({ id, index })` on a wrapper `<div>` around each `Accordion.Item`.

**Pattern**:
```tsx
// Parent (OutputWindow)
<DragDropProvider onDragEnd={handleDragEnd}>
  <Accordion.Root ...>
    {skillGroups.map((group, index) => (
      <SkillGroupAccordion key={group.skillId} group={group} index={index} />
    ))}
  </Accordion.Root>
</DragDropProvider>

// Child (SkillGroupAccordion)
const { ref, handleRef } = useSortable({ id: group.skillId, index });
return (
  <div ref={ref}>
    <Accordion.Item id={group.skillId}>
      <Accordion.Heading>
        <Accordion.Trigger>
          <div ref={handleRef}><GripVertical /></div>
          {group.skillName}
        </Accordion.Trigger>
      </Accordion.Heading>
      ...
    </Accordion.Item>
  </div>
);
```

**DragEnd handling**:
```ts
function handleDragEnd({ operation }: DragEndEvent) {
  if (!isSortableOperation(operation)) return;
  const { source, target } = operation;
  reorderSkillGroups(agentId, from, to);  // new store action
}
```

**Rationale**: Identical to the existing `Snippets`/`SnippetItem` pattern — no new concepts, no additional API surface.  
**Alternatives considered**: `useDraggable` + `useDroppable` (lower-level, more boilerplate, no existing pattern in project).

---

## Decision 3: Skill Group Ordering — `skillGroupOrder` on Agent

**Decision**: Add `skillGroupOrder: string[]` to the `Agent` interface. This is an ordered array of skill IDs representing the user's preferred group ordering for that agent.

**Derivation rules**:
1. Skills explicitly in `skillGroupOrder` appear in that order.
2. Skills NOT in `skillGroupOrder` (new skills added after agent creation) are appended alphabetically after the explicit ones.
3. `UNTAGGED_SKILL_ID` (`"__untagged__"`) always renders last, regardless of `skillGroupOrder` contents.
4. Skills in `skillGroupOrder` with no active snippets are simply skipped.

**Empty array default**: All groups derived alphabetically — consistent first-launch experience.

**Serialization**: `structuredClone` already handles plain arrays. `SerializedAgent` gains `skillGroupOrder: string[]`. `importState` defaults missing field to `[]` for backward compatibility.

**Rationale**: Minimal footprint — one new array on Agent, participates automatically in the existing draft/baseline/save/discard model.

---

## Decision 4: Within-Group Snippet Order — Alphabetical (Skill Window Order)

**Decision** (user-directed): Snippets within each skill group accordion appear in the same order as in the SnippetsPanel — alphabetical by snippet name, via `selectSnippetsForSkill`.

**Key finding from codebase exploration**: `selectSnippetsForSkill` already returns `sortByName(result)`. The SnippetsPanel renders in this order. The existing `activeOrder` field on Agent tracks drag-reordering but is never read back by the display selectors (a disconnect in the current code). The user's instruction resolves this: output order is now driven by skill group order × alphabetical within group.

**Impact**: `activeOrder` is no longer consulted for output compilation. It remains on the Agent type (it still tracks activation sequence and participates in cascade deletes) but is not the source of truth for output ordering.

**Rationale**: Alphabetical within-group order matches the SnippetsPanel exactly, delivering the "skill window order" the user specified. Simpler than any custom per-agent per-skill ordering.

---

## Decision 5: Multi-Skill Snippet Display vs. Compilation

**Decision** (user-confirmed): A snippet tagged to multiple skills appears visually in every matching skill group's accordion body. In the compiled output it is emitted only once — at the position of its first matching group in skill group order.

**Implementation**: Groups are iterated in order; a `seen: Set<string>` tracks emitted IDs. Alphabetical order within each group is fixed, so "first group" is deterministic.

---

## Decision 6: Compiler Update Strategy

**Decision**: Introduce `compileOutputBySkillGroup` alongside (not replacing) the existing `compileOutput`. Update `selectCompiledOutput` to call the new function. `compileOutput` is retained for backward compatibility with existing tests.

New signature:
```ts
compileOutputBySkillGroup(
  agent: Agent,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
  settings: OutputSettings,
): string
```

Within-group snippet order: alphabetical (via `sortByName`, consistent with `selectSnippetsForSkill`).

---

## Decision 7: No New Dependencies

**Decision**: No new npm packages are required. HeroUI Accordion is already bundled; dnd-kit is already installed.

**Bundle impact**: Negligible — accordion component is tree-shakeable from the existing `@heroui/react` bundle.
