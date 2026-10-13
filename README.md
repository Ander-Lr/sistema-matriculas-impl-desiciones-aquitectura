# University Enrollment System — refactored version

Application for the **Software Architecture** course. It starts from the original teaching system (everything in `server.js` and `public/app.js`, data in memory) and applies the architectural decisions documented in [`docs/adr/`](docs/adr).

**Architecture:** Express monolith with MVC roles · PostgreSQL 18 · REST API `/api/v1` · OAuth 2.0 + OpenID Connect with step-up MFA and roles · frontend with ES modules and Bootstrap 5.3.8 · Nginx + systemd.

## Structure

```
backend/        app.js (builds Express), server.js (opens the port), config/, db/
routes/         CONTROLLER: URL + verb + allowed roles
controllers/    CONTROLLER: receives the request and returns the HTTP response
services/       business rules (seats, duplicates, transaction)
models/         MODEL: the only place with SQL
validators/     input rules and pagination
middlewares/    authentication, roles, MFA, error handler
errors/         business errors → HTTP status codes
frontend/       VIEW: index.html, css/, js/api.js, js/ui.js, js/main.js
database/       schema.sql, seed.sql
deploy/         nginx.conf, enrollment.service, enrollment.env.example
docs/           ADRs and traceability table
tests/          one or more tests per finding (H01–H15)
```

## Running in development

Requirements: Node.js 24 and PostgreSQL 18.

```bash
# 1. Database (once, in psql as superuser)
CREATE USER enrollment PASSWORD 'change_me';
CREATE DATABASE enrollment OWNER enrollment;
CREATE DATABASE enrollment_test OWNER enrollment;   -- used by the tests

# 2. Project
npm ci
cp .env.example .env        # on Windows: copy .env.example .env
npm run db:reset            # creates the tables and loads the sample data
npm start                   # http://127.0.0.1:3000
```

Use the session panel in the top bar: choose **Administrative staff** or **Student**, the ID and whether the session has **MFA**. The panel calls `/auth/dev-token`, which simulates the identity provider and **only exists outside production**.

## Tests

```bash
npm test
```

The tests use `TEST_DATABASE_URL` or, if it is not set, the `DATABASE_URL` database with the `_test` suffix (for example `enrollment_test`). They **drop and recreate the tables** of that database, so they refuse to run if its name does not end in `_test`.

## API

All routes require `Authorization: Bearer <token>`.

| Method and route | Roles | MFA | Responses |
| --- | --- | --- | --- |
| `GET /api/v1/students?q=&limit=&offset=` | staff, student | no | 200 |
| `POST /api/v1/students` | staff | yes | 201, 422 |
| `GET /api/v1/courses?q=&limit=&offset=` | staff, student | no | 200 |
| `POST /api/v1/courses` | staff | yes | 201, 422 |
| `GET /api/v1/enrollments?q=&limit=&offset=` | staff, student | no | 200 |
| `POST /api/v1/enrollments` | staff; student only for themselves | yes | 201, 403, 404, 409, 422 |
| `GET /api/v1/report?q=&limit=&offset=` | staff | no | 200 |

No token or invalid token → 401 · insufficient role → 403 · missing MFA → 401. Maximum `limit`: 100.

## Deployment

See the comments in [`deploy/enrollment.service`](deploy/enrollment.service) and [`deploy/nginx.conf`](deploy/nginx.conf). With `NODE_ENV=production` the application does not start if `OIDC_ISSUER`, `OIDC_AUDIENCE` or `OIDC_JWKS_URI` are missing.

## Authors

- Lara Chicaiza Anderson Lenin
- Calapucha Ñacata Carlos Vicente

Universidad de las Fuerzas Armadas ESPE, Santo Domingo campus · Software Architecture · NRC 32828 · Instructor: Eng. Kevin Chuquitarco.
