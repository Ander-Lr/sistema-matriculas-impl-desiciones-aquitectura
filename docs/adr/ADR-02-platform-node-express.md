# ADR-02 · Platform: Node.js 24 + Express 5 with ES modules

**Status:** accepted · **Findings:** H12, H15

## Context
The original used CommonJS, `^` versions (not reproducible), no `engines` field, no test script, and the port was hard-coded.

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| **Node.js 24 LTS + Express 5.2.1** | It is what the system already uses: refactor instead of rewrite; Express 5 handles errors from `async` functions | Express does not impose a structure (hence ADR-01) |
| NestJS | Built-in structure and dependency injection | Framework with an imposed structure: it would force rewriting the whole system |
| Fastify | Faster, schema validation | Changing frameworks solves no finding and adds a learning curve |
| Another language (Java/Spring, Python/Django) | Mature ecosystems | Full rewrite; the team and existing code are JavaScript |

## Decision
Node.js 24 (`.nvmrc`, `engines`), Express 5.2.1, `"type": "module"`, exact versions and the scripts `start`, `dev`, `test` and `db:reset`. Configuration through environment variables in `backend/config/config.js`.

## Justification
Frameworks with an imposed structure (React, Angular, NestJS) were not used because they would force rewriting the system instead of refactoring it. Exact versions make every team member and the server run the same code.

## Consequences
- ✅ `npm ci` installs exactly the same versions on any machine.
- ✅ If the configuration is invalid (port, database), the server does not start and explains why.
- ⚠️ Exact versions do not receive automatic patches: they must be updated on purpose (`npm outdated`).

**Evidence:** `package.json`, `.nvmrc`, `.env.example`, `backend/config/config.js` · tests `H12 ·` and `H15 ·`.
