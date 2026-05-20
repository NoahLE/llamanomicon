# Contract: Output Compilation

**Branch**: `001-v1-core` | **Date**: 2026-03-07

## Purpose

Defines the deterministic algorithm that transforms `AppState` + an active `Flow` into the
compiled prompt string displayed in the Output Window. This is a pure function contract —
same inputs always produce the same output.

## Function Signature

```ts
function compileOutput(
  library: Library,
  flow: Flow | null,
  settings: OutputSettings,
): string;
```

**Returns**: The compiled prompt string. Returns `""` (empty string) if `flow` is `null`
or if no snippets are active.

## Algorithm (Normative)

```
output = ""

For each group in library.groups (in array order):
  groupActive = flow.activation.groups[group.id] ?? false
  IF NOT groupActive: SKIP this group

  activeSnippets = group.snippets
    .filter(s => flow.activation.snippets[s.id] ?? false)
    .sort((a, b) => a.order - b.order)

  IF activeSnippets.length === 0: SKIP this group

  IF settings.showGroupHeaders:
    output += "### " + group.name + "\n"

  For each snippet in activeSnippets:
    output += snippet.text + settings.snippetSeparator

  output += "\n"   ← group separator (always appended, regardless of snippetSeparator)

RETURN output.trimEnd()   ← remove trailing whitespace/newlines
```

## Behavioral Rules

| Rule             | Description                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Group order      | Determined by `library.groups` array order; NOT by Flow                                                  |
| Snippet order    | Determined by `Snippet.order` field (ascending integer)                                                  |
| Group gate       | A group with `activation.groups[id] = false` contributes nothing, even if individual snippets are `true` |
| Empty group      | A group with no active snippets contributes nothing (no header emitted)                                  |
| Group separator  | A blank line (`"\n"`) is always appended after each active group block                                   |
| Header format    | Exactly `"### "` + group name + `"\n"` when `showGroupHeaders = true`                                    |
| snippetSeparator | Appended after each snippet's text; default `"\n"`                                                       |
| Trailing content | `trimEnd()` is applied to the final string before returning                                              |
| Null flow        | Returns `""` immediately                                                                                 |

## Example

Given:

```
library.groups = [
  { id: "g1", name: "Coding Best Practices", snippets: [
    { id: "s1", text: "Keep code modular", order: 0, groupId: "g1" },
    { id: "s2", text: "Explain assumptions", order: 1, groupId: "g1" },
  ]},
  { id: "g2", name: "Output Format", snippets: [
    { id: "s3", text: "Use markdown tables", order: 0, groupId: "g2" },
  ]},
]

flow.activation = {
  groups:   { g1: true, g2: false },
  snippets: { s1: true, s2: false, s3: true },
}

outputSettings = { showGroupHeaders: true, snippetSeparator: "\n" }
```

Expected output:

```
### Coding Best Practices
Keep code modular
```

**Explanation**: `g2` is suppressed by group toggle. `s2` is individually toggled off.
`s3` is active but its group (`g2`) is off, so it is excluded. `s1` is the only active
snippet.

## Implementation Location

`src/lib/compiler.ts` — exported as named export `compileOutput`. No side effects.
This function MUST be pure: no store access, no DOM access, no async operations.

## Performance Requirement

`compileOutput` MUST complete in < 1 ms for a library with 50 groups and 500 snippets.
It is called on every relevant state change (toggle, reorder) — it runs on every render
frame that updates the Output Window.
