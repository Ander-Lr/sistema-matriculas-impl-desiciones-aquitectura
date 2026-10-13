# ADR-07 · Frontend: HTML5, CSS3 and JavaScript with ES modules + local Bootstrap 5.3.8

**Status:** accepted · **Findings:** H05, H13, H14

## Context
`app.js` mixed HTTP, DOM and events; the POST `fetch` was repeated 3 times; `getJSON` did not check `response.ok`; tables were rendered with `innerHTML` and string templates (the origin of the XSS in H05); and there was no search.

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| **JavaScript with ES modules** (`api.js`, `ui.js`, `main.js`) | No build step; the existing code is refactored; separated responsibilities | No automatic reactivity: re-rendering is manual |
| React / Angular / Vue | Components, ecosystem | Framework with an imposed structure and a build step: it would mean rewriting the frontend |
| Keep a single `app.js` fixing `innerHTML` | Smallest change | Solves H05 but not H13 |
| Bootstrap from a CDN | Nothing to install | Depends on the Internet and conflicts with helmet's CSP |

## Decision
- `api.js`: the single gateway to the API (one `fetch`, token, `response.ok`, errors).
- `ui.js`: renders the DOM only with `createElement` and `textContent`.
- `main.js`: form events, search boxes (`?q=` with a 300 ms delay) and the session panel.
- Bootstrap 5.3.8 installed with npm and served by Express at `/vendor/bootstrap`.

## Justification
Each file has a single reason to change, and the security rule (never insert HTML built from server data) is concentrated in `ui.js`.

## Consequences
- ✅ The name `<img src=x onerror=…>` appears as text.
- ✅ A change in the API (URL, headers) is made in a single file.
- ✅ The interface hides what the role cannot use (the server always checks again).
- ⚠️ If the interface grows a lot, manual re-rendering will become costly and could justify a framework.

**Evidence:** `frontend/index.html`, `frontend/js/api.js`, `ui.js`, `main.js` · tests `H05 · the frontend never inserts HTML…` and `H13 ·`.
