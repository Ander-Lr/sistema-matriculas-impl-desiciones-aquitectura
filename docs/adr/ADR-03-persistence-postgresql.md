# ADR-03 · Persistence: PostgreSQL 18 with the `pg` driver

**Status:** accepted · **Findings:** H02, H04, H09, H10, H11

## Context
Data lived in in-memory arrays: it was lost on restart (H02), IDs were computed with `Math.max(...arr)`, which fails from 125,156 records (H09), the report crossed arrays with `find` inside `map`, blocking the only thread (H10), referential integrity was manual (H11), and two simultaneous enrollments could exceed the seats (H04).

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| JSON file | Simple | No transactions or concurrency control; does not solve H04 or H11 |
| MongoDB | Flexible | The data is relational (student–enrollment–course); no foreign keys |
| MySQL / MariaDB | Relational, well known | Equivalent to PostgreSQL; no advantage for this case |
| **PostgreSQL 18 + `pg` 8.23.1** | Transactions, `FOR UPDATE`, FK, `UNIQUE`, `CHECK`, `IDENTITY` | Requires installing and administering a database server |
| PostgreSQL + Sequelize (ORM) or Knex | Less hand-written SQL | Sequelize imposes its own way of working; both use `pg` underneath. Using three libraries for the same job makes no sense |

## Decision
PostgreSQL 18 with **only** `pg` 8.23.1 and parameterized SQL (`$1, $2`) inside `models/`. Schema in `database/schema.sql` with `IDENTITY`, foreign keys, `UNIQUE (student_id, course_id)` and `CHECK`. Enrollment runs in a transaction with `SELECT … FOR UPDATE` on the course.

## Justification
The rules that previously depended on the code are now guaranteed by the database: even if someone bypasses the API, they cannot create an orphan or duplicate enrollment, or negative seats.

## Consequences
- ✅ Data survives restarts.
- ✅ Five simultaneous enrollments for the last seat: one succeeds, the others receive 409.
- ✅ Parameterized SQL prevents SQL injection.
- ✅ The report is computed by PostgreSQL (`JOIN` + `array_agg`), so the Node.js process stays free (H10).
- ⚠️ `FOR UPDATE` serializes enrollments for the same course (acceptable: milliseconds).
- ⚠️ The database must be backed up (`pg_dump`) and schema changes must be managed.

**Evidence:** `database/schema.sql`, `backend/db/pool.js`, `models/`, `services/enrollmentService.js` · tests `H02`, `H04`, `H09`, `H10`, `H11`.
