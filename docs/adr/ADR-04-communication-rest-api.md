# ADR-04 · Communication: versioned REST API (`/api/v1`) with JSON

**Status:** accepted · **Findings:** H03, H07, H08, H14

## Context
The original API accepted any data with 201 (`POST {}` → 201, semester 99 → 201, seats −5 → 201), returned 400 for every business error, a malformed JSON returned an HTML page with the stack trace, it was not versioned, and it always returned the complete list.

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| **Versioned REST + JSON** | Standard, easy to test with Postman, the current frontend already uses `fetch` | Several calls for composite screens |
| GraphQL | The client requests exactly what it needs | New server and client; unnecessary complexity for 4 resources |
| gRPC | Very efficient | Does not work directly from the browser |
| Server-side rendering (templates) | No API | Changes the frontend architecture; it is not a refactoring |

## Decision
Routes under `/api/v1/...`; validators in `validators/`; a central error handler; status codes 201 + `Location`, 400, 401, 403, 404, 409 and 422; search with `?q=` and pagination with `limit` (max. 100) and `offset`.

## Justification
Versioning allows the API to change without breaking clients; correct status codes tell the client what happened without parsing text; pagination avoids huge responses.

## Consequences
- ✅ `POST {}` → 422; non-existent → 404; duplicate → 409.
- ✅ Internal errors return a generic message (no details are leaked) and `X-Powered-By` is removed.
- ⚠️ List responses are arrays without the total count; if needed, it will be added in `/api/v2` or as a header.

**Evidence:** `routes/index.js`, `validators/`, `middlewares/errorHandler.js`, `errors/AppError.js` · tests `H03`, `H07`, `H08`, `H14`.
