# ADR-01 · Structure: monolith with MVC roles

**Status:** accepted · **Findings:** H01, H13

## Context
The whole original backend lived in a single `server.js` (data, routes, rules and HTTP responses mixed together) and the whole frontend in a single `app.js`. Any change required editing the complete file, and no part could be tested in isolation.

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| Keep a single file | Zero effort | Does not solve H01 or H13; maintainability stays the same |
| **Monolith with MVC roles** (routes → controllers → services → models) | One process and one deployment; each change touches a bounded layer; refactoring instead of rewriting | More files; requires discipline not to skip layers |
| Microservices (students, courses, enrollments) | Independent scaling and deployment | Enrollment needs one transaction across student, course and seats; it would become distributed. Too much operational complexity for the system size |
| Hexagonal / clean architecture | Fully isolates the domain | Oversized for four entities; more abstractions than business rules |

## Decision
Modular monolith with MVC roles: `routes/` and `controllers/` (Controller), `services/` (business rules), `models/` (Model, the only place with SQL) and `frontend/` (View). Express serves the frontend and the API from a single process.

## Justification
Separate responsibilities so that each change touches a bounded part (maintainability), without paying the cost of a distributed system. The seat rule stays inside a single local transaction.

## Consequences
- ✅ Each layer can be read and tested separately; controllers contain no SQL (verified in `tests/structure.test.js`).
- ✅ A single artifact to deploy and monitor.
- ⚠️ The whole application scales together: if one module needed to scale alone, it would have to be extracted later.
- ⚠️ The separation depends on team discipline; nothing prevents importing a model from a route.

**Evidence:** `routes/`, `controllers/`, `services/`, `models/`, `frontend/js/` · test `H01 · the backend is split into MVC layers`.
