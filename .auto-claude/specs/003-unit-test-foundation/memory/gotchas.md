# Gotchas & Pitfalls

Things to watch out for in this codebase.

## [2026-01-03 18:27]
npm commands are blocked in this environment - package installation must be done manually or through CI

_Context: Tried to run 'npm install' but received error: Command 'npm' is not in the allowed commands for this project_
