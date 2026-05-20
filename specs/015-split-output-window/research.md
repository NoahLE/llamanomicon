# Research: Split Output Window (Feature 015)

## Decisions

### 1. Toggle Component

**Decision**: Use a `ButtonGroup` containing two `Button` elements ("XML" / "Text").

**Rationale**: `ButtonGroup` is already used in `Agents.tsx:65`. There is no HeroUI `Tabs` or `ToggleGroup` component currently in the codebase, so introducing one would add a new pattern without a precedent (Constitution §II). The two-button group approach is already established and visually clear.

**Alternatives considered**:
- HeroUI `Tabs` — not currently used; would be a new UI primitive without precedent.
- HeroUI `Switch` — used in `SnippetItem.tsx` for on/off state; semantically wrong for a two-option format selection.
- Custom radio-button group — unnecessary; `ButtonGroup` covers this cleanly.

**Active state styling**: The active format button uses `variant="primary"`, the inactive uses `variant="secondary"`, matching how other button groups distinguish selected state.

---

### 2. Format State Location

**Decision**: `useState<"xml" | "text">("xml")` local to `OutputWindow.tsx`. Not persisted.

**Rationale**: The spec explicitly states the toggle does not need to persist across sessions (FR-005). Adding it to `OutputSettings` / Zustand would add unnecessary store complexity (Constitution §V). Local state is the simplest correct solution.

**Alternatives considered**:
- Add to `OutputSettings` store slice and persist — ruled out; the spec explicitly excludes persistence.
- Add to session state (non-persisted Zustand) — overkill for one ephemeral boolean.

---

### 3. Raw Text Display Element

**Decision**: Use a `<pre>` element with `overflow-auto`, styled with an inset shadow matching the panel's neoskeumorphic design language.

**Rationale**: Snippet text may contain newlines and indentation; `<pre>` preserves whitespace formatting without additional parsing. It's a semantic HTML element for preformatted content. No HeroUI primitive covers this use case.

**Alternatives considered**:
- `<textarea readOnly>` — scrollable and selectable, but styled like an input field which is misleading for read-only compiled output.
- Plain `<div>` with `whitespace-pre` — equivalent to `<pre>` but less semantic.

---

### 4. Output Selectors

**Decision**: Reuse existing `selectCompiledOutput` (plain text) and `selectCompiledOutputXML` (XML) selectors from `src/store/useSettings.ts`. No new selectors needed.

**Rationale**: Both selectors are already implemented and tested. The copy button reads `outputFormat` state and conditionally passes either selector's result to `copy()`.

---

### 5. Component Extraction

**Decision**: Keep all logic within `OutputWindow.tsx`. Do not extract `RawOutput` into a separate file.

**Rationale**: Constitution §V requires at least two concrete call-sites for any abstraction. A `RawOutput` component would have exactly one call-site. The additional state (one `useState`) and JSX does not meet the threshold for extraction. Inline sections with clear comments are the simpler, correct choice.

---

### 6. Header Button Removal

**Decision**: Remove both existing copy buttons from the `OutputWindow` header. Remove the `copyXML` / `copiedXML` hook instance. Retain one `useCopyToClipboard` instance in the component, used by the Raw Output section's single copy button.

**Rationale**: FR-009 mandates removal. Leaving unused hooks would violate Constitution §I (dead code).
