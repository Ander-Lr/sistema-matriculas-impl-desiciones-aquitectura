// REST API tests: validation, HTTP status codes, security and search.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { start, finish } from "./helpers.js";

let ctx;
let staff;         // administrative staff with MFA
let staffNoMfa;    // administrative staff without MFA
let student;       // student with id 3

before(async () => {
  ctx = await start();
  staff = await ctx.token({ role: "staff", mfa: true });
  staffNoMfa = await ctx.token({ role: "staff", mfa: false });
  student = await ctx.token({ role: "student", mfa: true, sub: "3" });
});
after(() => finish(ctx));

// ---------- H03 · input validation ----------
test("H03 · POST {} to students returns 422", async () => {
  const r = await ctx.api("POST", "/api/v1/students", { body: {}, withToken: staff });
  assert.equal(r.status, 422);
});

test("H03 · semester 99 returns 422", async () => {
  const r = await ctx.api("POST", "/api/v1/students", {
    body: { name: "Ana", program: "Software", semester: 99 }, withToken: staff,
  });
  assert.equal(r.status, 422);
});

test("H03 · seats −5 returns 422", async () => {
  const r = await ctx.api("POST", "/api/v1/courses", {
    body: { name: "Networks", instructor: "Eng. X", seats: -5 }, withToken: staff,
  });
  assert.equal(r.status, 422);
});

test("H03 · a valid record returns 201 with a Location header", async () => {
  const r = await ctx.api("POST", "/api/v1/courses", {
    body: { name: "  Networks  ", instructor: "Eng. X", seats: "20" }, withToken: staff,
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.name, "Networks", "text is stored without extra spaces");
  assert.equal(r.body.seats, 20);
  assert.equal(r.headers.get("location"), `/api/v1/courses/${r.body.id}`);
});

// ---------- H05 · XSS ----------
test("H05 · a name containing HTML is stored as literal text and the page sends a CSP", async () => {
  const malicious = "<img src=x onerror=alert(1)>";
  const r = await ctx.api("POST", "/api/v1/students", {
    body: { name: malicious, program: "Software", semester: 3 }, withToken: staff,
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.name, malicious);

  const page = await fetch(`${ctx.url}/`);
  const csp = page.headers.get("content-security-policy");
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /script-src-attr 'none'/, "blocks inline handlers such as onerror=");
});

// ---------- H06 · identity and role ----------
test("H06 · without a token the API returns 401", async () => {
  const r = await ctx.api("GET", "/api/v1/courses");
  assert.equal(r.status, 401);
});

test("H06 · a forged token returns 401", async () => {
  const r = await ctx.api("GET", "/api/v1/courses", { withToken: "eyJhbGciOiJIUzI1NiJ9.e30.fake-signature" });
  assert.equal(r.status, 401);
});

test("H06 · a student trying to create a course gets 403", async () => {
  const r = await ctx.api("POST", "/api/v1/courses", {
    body: { name: "Hack", instructor: "X", seats: 5 }, withToken: student,
  });
  assert.equal(r.status, 403);
});

test("H06 · staff without MFA cannot modify data (401)", async () => {
  const r = await ctx.api("POST", "/api/v1/courses", {
    body: { name: "Networks", instructor: "X", seats: 5 }, withToken: staffNoMfa,
  });
  assert.equal(r.status, 401);
  assert.match(r.body.error, /MFA/);
});

test("H06 · staff without MFA can still read data", async () => {
  const r = await ctx.api("GET", "/api/v1/courses", { withToken: staffNoMfa });
  assert.equal(r.status, 200);
});

test("H06 · a student cannot enroll another student (403)", async () => {
  const r = await ctx.api("POST", "/api/v1/enrollments", {
    body: { studentId: 1, courseId: 3 }, withToken: student,
  });
  assert.equal(r.status, 403);
});

test("H06 · a student cannot see the academic report (403)", async () => {
  const r = await ctx.api("GET", "/api/v1/report", { withToken: student });
  assert.equal(r.status, 403);
});

// ---------- H08 · correct HTTP status codes ----------
test("H08 · enrolling a non-existent student returns 404", async () => {
  const r = await ctx.api("POST", "/api/v1/enrollments", { body: { studentId: 9999, courseId: 1 }, withToken: staff });
  assert.equal(r.status, 404);
});

test("H08 · enrolling in a non-existent course returns 404", async () => {
  const r = await ctx.api("POST", "/api/v1/enrollments", { body: { studentId: 1, courseId: 9999 }, withToken: staff });
  assert.equal(r.status, 404);
});

test("H08 · a duplicate enrollment returns 409", async () => {
  // The seed already enrolls student 1 in course 1.
  const r = await ctx.api("POST", "/api/v1/enrollments", { body: { studentId: 1, courseId: 1 }, withToken: staff });
  assert.equal(r.status, 409);
});

test("H08 · creating returns the record with its id and the Location header", async () => {
  const r = await ctx.api("POST", "/api/v1/students", {
    body: { name: "With id", program: "Software", semester: 1 }, withToken: staff,
  });
  assert.equal(r.status, 201);
  assert.ok(Number.isInteger(r.body.id));
  assert.equal(r.headers.get("location"), `/api/v1/students/${r.body.id}`);
});

test("H08 · the API is versioned: /api/v1 exists and the old unversioned route does not", async () => {
  const current = await ctx.api("GET", "/api/v1/students", { withToken: staff });
  const old = await ctx.api("GET", "/api/students", { withToken: staff });
  assert.equal(current.status, 200);
  assert.equal(old.status, 404);
});

// ---------- H07 · error handling and environment ----------
test("H07 · malformed JSON returns 400 as JSON, without stack trace or internal paths", async () => {
  const r = await fetch(`${ctx.url}/api/v1/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staff}` },
    body: "{bad json",
  });
  assert.equal(r.status, 400);
  assert.match(r.headers.get("content-type"), /application\/json/);
  assert.doesNotMatch(await r.text(), /node_modules|at .*\(|SyntaxError/);
});

test("H07 · responses do not reveal the technology (no X-Powered-By)", async () => {
  const r = await fetch(`${ctx.url}/`);
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("H07 · a non-existent API route returns 404 as JSON", async () => {
  const r = await ctx.api("GET", "/api/v1/does-not-exist", { withToken: staff });
  assert.equal(r.status, 404);
  assert.ok(r.body.error);
});

// ---------- H14 · search and pagination ----------
test("H14 · ?q= filters by name", async () => {
  const r = await ctx.api("GET", "/api/v1/students?q=gómez", { withToken: staff });
  assert.equal(r.status, 200);
  assert.ok(r.body.length >= 1);
  assert.ok(r.body.every((s) => s.name.toLowerCase().includes("gómez")));
});

test("H14 · limit and offset paginate the results", async () => {
  const page1 = await ctx.api("GET", "/api/v1/courses?limit=1&offset=0", { withToken: staff });
  const page2 = await ctx.api("GET", "/api/v1/courses?limit=1&offset=1", { withToken: staff });
  assert.equal(page1.body.length, 1);
  assert.equal(page2.body.length, 1);
  assert.notEqual(page1.body[0].id, page2.body[0].id);
});
