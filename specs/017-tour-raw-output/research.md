# Research: Tour Raw Output Step and Copy Cleanup

## Decision 1: How to add `data-tour-target="raw-output"` to RawOutput

**Decision**: Add an optional `tourTarget` prop to `AppSection` that overrides `variant` as the `data-tour-target` value.

**Rationale**: `AppSection` currently derives `data-tour-target` directly from `variant`. Both `OutputStructure` and `RawOutput` use `variant="output"`, which causes a DOM collision: two elements share `[data-tour-target="output"]` when there is compiled output. Decoupling tour targeting from visual variant resolves the collision cleanly without requiring a wrapper div.

**Alternatives considered**:
- **Wrapper div in RawOutput**: Adds a layout layer just for attribute placement. Rejected — adds nesting without semantic value.
- **New PanelVariant value "raw-output"**: Would require new CSS token entries and visual tokens for a variant that needs no distinct styling. Rejected — over-engineering.
- **Leave AppSection unchanged; use a sibling div**: Would mean the tour tooltip targets a wrapper, not the AppSection card itself. Rejected — inconsistent with how all other steps target AppSection cards.

---

## Decision 2: Em-dash replacements

**Decision**: Replace em-dashes with commas or natural sentence restructuring. No hyphens.

**Rationale**: Hyphens imply a range or compound modifier. Commas are the natural spoken-language equivalent of the em-dash pause used in these sentences.

**Specific replacements identified in `src/data/tour.ts`**:
- Step 2 (Agent List): `"Agents are your prompt profiles — one per context (coding assistant, writing helper, etc.)."` → `"Agents are your prompt profiles, one per context (coding assistant, writing helper, etc.)."`
- Step 5 (Output Window): `"Hit Copy to send it straight to your clipboard — ready to paste into any LLM."` → `"Hit Copy to send it straight to your clipboard, ready to paste into any LLM."`

---

## Decision 3: Output Structure step copy update

**Decision**: Update the existing "Output Window" step title to "Output Structure" and narrow its intro copy to describe the accordion view specifically.

**Rationale**: After the 015-split-output-window feature, the output column has two distinct panels. The existing step currently describes the full output area in generic terms. Now that Raw Output gets its own step immediately after, the Output Structure step should be scoped to its panel to avoid redundancy and user confusion.

---

## Decision 4: Raw Output step copy

**Decision**: New step intro text — "This is your compiled prompt as flat text. Use the XML or Text toggle to switch formats, then hit the copy button to send it to your clipboard."

**Rationale**: Concise, explains both interactive controls, no em-dashes, no filler.
