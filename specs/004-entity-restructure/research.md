# Research: Entity Restructure

## Decision 1: Map/Set Serialization

**Decision**: Tagged serialization format (`{ __type: "Map", entries: [...] }` / `{ __type: "Set", values: [...] }`) in a dedicated `src/lib/serialization.ts` module.

**Rationale**: Self-describing format that round-trips cleanly. Applied at Zustand persist boundary, not throughout application code. Alternative of plain object/array conversion loses type information during deserialization.

**Alternatives considered**:
- `structuredClone` only (no JSON): Would work for Dexie but breaks import/export JSON and Zustand's string-based persist.
- Plain object/array conversion: Simpler but ambiguous — can't distinguish `Record<string, T>` from a serialized `Map<string, T>` during deserialization.
- superjson library: Adds a dependency for something achievable in ~30 lines.

## Decision 2: snippetsBySkill Index Placement

**Decision**: Non-persisted Zustand store field, rebuilt by `rebuildIndex()` action using pure function from `src/lib/indexes.ts`.

**Rationale**: Available to all selectors/components via normal hook. Cheap to rebuild at this scale (~2k snippets). A selector-based approach would recompute on every render. A separate React context adds unnecessary complexity.

**Alternatives considered**:
- Zustand selector (recompute on access): Wasteful — recomputes even when snippets haven't changed.
- React context: Extra provider layer for no benefit.
- Zustand `subscribe` auto-rebuild: Less predictable than explicit `rebuildIndex()` calls.

## Decision 3: Session Draft/Baseline

**Decision**: `baseline` (persisted) + `draft` (ephemeral). `structuredClone` for deep copy. All UI reads/writes go through `draft`.

**Rationale**: `structuredClone` handles Map/Set natively in all target browsers (Chrome 98+, Firefox 94+, Safari 15.4+). Persisting only baseline gives discard-by-default on refresh, which is correct.

**Alternatives considered**:
- Immer patches: Overkill for this scale. Adds a dependency.
- Manual deep clone: Error-prone for Map/Set. `structuredClone` is purpose-built.
- Persist both session and baseline: Wrong semantic — session state should be ephemeral.

## Decision 4: Repository Base Class

**Decision**: Yes — `Repository<T extends Entity>` with 7 shared methods. ~25 lines, 3 consumers.

**Rationale**: Meets rule-of-three (3 entity types). Keeps cascade logic out of the generic class (in entity-specific slices), avoiding premature abstraction.

**Alternatives considered**:
- No base class (inline CRUD in each slice): 21 duplicated implementations.
- Full ORM-style repository with relationships: Over-engineered for 3 simple entities.

## Decision 5: OutputSettings Simplification

**Decision**: Remove `showGroupHeaders`. Keep `snippetSeparator`.

**Rationale**: Skills are tags, not output sections. There's no concept of "group headers" in the new model. The compiler becomes trivial: map activeOrder → texts → join.

**Alternatives considered**:
- Keep `showGroupHeaders` as dead field: Constitution forbids dead code.
- Replace with `showSkillHeaders`: Skills aren't structural — a snippet can have multiple skills, so "skill headers" in output doesn't make sense.
