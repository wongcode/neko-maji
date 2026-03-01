# AGENTS.md

## Cursor Cloud specific instructions

**Neko Maji** is a client-side-only Suika-style puzzle web game (Preact + Phaser 3 + Matter.js, built with Vite). There is no backend, database, or external service.

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Vite, port 5173) |
| Build (type-check + bundle) | `npm run build` |
| Unit tests | `npx vitest run` |
| Full verification | `bash verify.sh` |

### Gotchas

- `npm install` requires `--legacy-peer-deps` due to `vitest@^4` peer-requiring `vite@^6`/`@types/node@^20` while the project pins older versions. The lockfile resolves correctly with this flag.
- One pre-existing test failure: `should have exactly 11 levels of toys` expects 11 items in `TOYS` but the array currently has 9. This is a codebase issue, not an environment issue.
- No environment variables or secrets are needed.
