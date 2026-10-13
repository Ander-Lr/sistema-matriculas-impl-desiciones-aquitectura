// Data tests: persistence, concurrency, volume and integrity.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { start, finish, pool, TEST_DATABASE_URL } from "./helpers.js";

let ctx;
let staff;

before(async () => {
  ctx = await start();
  staff = await ctx.token({ role: "staff", mfa: true });
});
after(() => finish(ctx));

test("H02 · data is stored in PostgreSQL, not in memory", async () => {
  const r = await ctx.api("POST", "/api/v1/students", {
    body: { name: "Persistent", program: "Software", semester: 2 }, withToken: staff,
  });
  assert.equal(r.status, 201);

  // A new connection, independent from the application, finds the record.
  const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query("SELECT name FROM students WHERE id = $1", [r.body.id]);
    assert.equal(rows[0]?.name, "Persistent");
  } finally {
    await client.end();
  }
});

test("H04 · five simultaneous enrollments in a 1-seat course: only one succeeds", async () => {
  const course = await ctx.api("POST", "/api/v1/courses", {
    body: { name: "Last seat", instructor: "Eng. Y", seats: 1 }, withToken: staff,
  });
  const ids = [];
  for (let i = 0; i < 5; i++) {
    const s = await ctx.api("POST", "/api/v1/students", {
      body: { name: `Concurrent ${i}`, program: "Software", semester: 1 }, withToken: staff,
    });
    ids.push(s.body.id);
  }

  const responses = await Promise.all(ids.map((studentId) =>
    ctx.api("POST", "/api/v1/enrollments", { body: { studentId, courseId: course.body.id }, withToken: staff })
  ));
  assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409, 409, 409, 409]);

  const { rows } = await pool.query("SELECT seats FROM courses WHERE id = $1", [course.body.id]);
  assert.equal(rows[0].seats, 0, "seats never become negative");
});

test("H09 · with more than 125,156 records it is still possible to create and list", async () => {
  // The original system used Math.max(...ids), which threw RangeError from 125,156 records.
  await pool.query(`
    INSERT INTO students (name, program, semester)
    SELECT 'Bulk ' || g, 'Software', 1 + g % 12 FROM generate_series(1, 130000) AS g`);

  const r = await ctx.api("POST", "/api/v1/students", {
    body: { name: "After the bulk load", program: "Software", semester: 1 }, withToken: staff,
  });
  assert.equal(r.status, 201);
  assert.ok(r.body.id > 130000);

  const list = await ctx.api("GET", "/api/v1/students?limit=100000", { withToken: staff });
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 100, "the maximum page size is 100");
});

test("H10 · the report is computed in SQL and a simple request does not wait for it", async () => {
  // There are more than 130,000 students (previous test). The report runs in
  // PostgreSQL, so the Node.js process stays free for other requests.
  const startTime = performance.now();
  const reportRequest = ctx.api("GET", "/api/v1/report?q=Bulk", { withToken: staff });
  const simple = await ctx.api("GET", "/api/v1/courses?limit=1", { withToken: staff });
  const elapsed = performance.now() - startTime;
  assert.equal(simple.status, 200);
  assert.equal((await reportRequest).status, 200);
  assert.ok(elapsed < 500, `the simple request took ${elapsed.toFixed(0)} ms`);
});

test("H11 · the database rejects an orphan enrollment (foreign key)", async () => {
  await assert.rejects(
    pool.query("INSERT INTO enrollments (student_id, course_id) VALUES (1, 999999)"),
    (error) => error.code === "23503"
  );
});

test("H11 · the database rejects a duplicate enrollment even bypassing the API (UNIQUE)", async () => {
  await assert.rejects(
    pool.query("INSERT INTO enrollments (student_id, course_id) VALUES (1, 1)"),
    (error) => error.code === "23505"
  );
});

test("H11 · the database rejects negative seats (CHECK)", async () => {
  await assert.rejects(
    pool.query("UPDATE courses SET seats = -1 WHERE id = 1"),
    (error) => error.code === "23514"
  );
});
