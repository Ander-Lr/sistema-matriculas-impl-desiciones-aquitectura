# ADR-06 · Security: OAuth 2.0 + OpenID Connect with step-up MFA and role-based access control

**Status:** accepted · **Findings:** H05, H06

## Context
The original had no authentication (anyone could create courses or enroll students), did not distinguish between students and administrative staff, and was vulnerable to XSS: a name `<img src=x onerror=…>` was saved with 201 and executed when the page was opened.

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| Own username/password + sessions | Full control | Storing institutional passwords in the application; duplicating accounts that already exist |
| Own JWT signed by the application | Simple | The application becomes an identity provider; no MFA or central sign-out |
| **OAuth 2.0 + OIDC with the institutional provider, step-up MFA and roles** | Single sign-on, MFA managed by the provider, the application never sees passwords | Depends on the identity provider's availability |
| SAML | Established institutional standard | More complex to integrate with a JSON API |

## Decision
- The token (JWT) is issued by the OIDC provider and the API verifies it with `jose` against its public keys (JWKS), checking issuer and audience.
- `allow(...roles)` on every route: **administrative staff** create students and courses and see the report; a **student** can read data and enroll only themselves.
- **Step-up MFA:** reading does not require MFA; every operation that modifies data does (`requireMfa`, `amr` claim).
- `helmet()` adds security headers and a CSP that blocks inline scripts; the frontend only uses `textContent` (see ADR-07).
- In development, `/auth/dev-token` simulates the provider; the configuration forbids it in production.

## Justification
Authentication is delegated to whoever already manages it (the institution), and the application only authorizes according to the role. MFA is requested only where the risk justifies it.

## Consequences
- ✅ No token → 401; a student creating a course → 403; staff without MFA → 401.
- ✅ The malicious name from H05 is displayed as text and is not executed.
- ⚠️ If the identity provider goes down, nobody can sign in.
- ⚠️ The token lives for 2 h in `sessionStorage`; immediate revocation would require shorter tokens or introspection.

**Evidence:** `middlewares/auth.js`, `routes/*Routes.js`, `routes/authRoutes.js`, `backend/app.js` · tests `H05` and `H06`.
