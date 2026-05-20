# Contributing

## Setup

```bash
pn install   # pnpm install
pn dev       # start dev server (http://localhost:5173)
```

## Tests

Tests use Vitest. Run them with:

```bash
pn test             # run all tests once
pn run test-watch   # watch mode
```

Tests are co-located with their source by directory:

| Directory               | Covers                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `src/store/tests/`      | Store slice unit tests (Snippets, Skills, Agents, DataControls, Settings, Selectors) |
| `src/lib/tests/`        | Library unit tests (compiler, serialization, indexes, import/export, Repository)     |
| `src/components/tests/` | Component smoke tests                                                                |
| `e2e/`                  | Playwright tests                                                                     |

Component test files must include `// @vitest-environment jsdom` at the top.

## Code Quality

All three must pass before merging:

```bash
pn lint-all    # type-check + ESLint + knip + Prettier auto-fix
pn test-all    # all tests pass
pn build       # clears output/ then type-check + production build
```

TypeScript is in strict mode with `noUncheckedIndexedAccess: true`. Do not use `// @ts-ignore` or `any` to silence errors — fix the root cause.
