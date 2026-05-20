# Llamanomicon

## About

A local-first, offline PWA for composing LLM prompts from reusable text snippets.

The core loop: select an **Agent** > activate **Snippets** > copy the compiled output.

## Getting Started

When you first open the app, an onboard wizard will appear. You can always retrigger this wizard by opening up the `Settings` menu and clicking `Restart Tour`.

## Themes

### Light

![light theme](/e2e/snapshots/theme.spec.ts/chromium/app-light-theme.png)

### Dark

![dark theme](/e2e/snapshots/theme.spec.ts/chromium/app-dark-theme.png)

## Docs

| Document                                           | Summary                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| [Architecture](docs/architecture.md)               | App layers, tech stack, and folder structure                                |
| [Contributing](docs/contributing.md)               | Setup, branch workflow, and code quality gates                              |
| [Models](docs/models.md)                           | Data model — Agents, Skills, Snippets — entity types, fields, cascade rules |
| [Spec Kit](docs/spec-kit.md)                       | How to use spec-kit with this project                                       |
| [State and Data Flow](docs/state-and-data-flow.md) | Store, compiler, persistence, and import/export                             |
| [Styling](docs/styling.md)                         | Design philosophy, component libraries, motion libraries                    |

## Quick Start

```bash
pn install   # Install dependencies with pnpm
pn dev       # Start dev server with HMR (http://localhost:5173)
pn lint-all  # Lint and format the code
pn test-all  # Run unit and e2e tests
pn build     # Build the app
pn commit    # Create styled commit messages
```
