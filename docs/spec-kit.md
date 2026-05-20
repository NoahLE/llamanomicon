# Using Spec-Kit

## Spec-Kit Commands

Run with `/speckit.ACTION`

| command         | description                                                    | usage                                                     |
| --------------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| `/constitution` | Create project governing principles and development guidelines | Run first to establish project standards                  |
| `/specify`      | Define what you want to build (requirements and user stories)  | Focus on the what and why, not tech stack                 |
| `/clarify`      | Clarify underspecified areas through structured questioning    | Must run before /plan unless explicitly skipped           |
| `/plan`         | Create technical implementation plans with chosen tech stack   | Specify architecture, frameworks, and technical decisions |
| `/tasks`        | Generate actionable task lists for implementation              | Breaks down plan into executable steps                    |
| `/analyze`      | Cross-artifact consistency & coverage analysis                 | Run after /tasks, before /implement                       |
| `/implement`    | Execute all tasks to build the feature according to plan       | Generates working code from specifications                |

### Making an update

1. Start with `/specify`
2. Update the spec as needed with `/clarify`
3. Add tech notes with `/plan`
4. Generate a to-do list with `/tasks`
5. Then repeat `/implement` until done

### Less common

- Update project standards with `/constitution`
- Check for spec updates using `/analyze`
