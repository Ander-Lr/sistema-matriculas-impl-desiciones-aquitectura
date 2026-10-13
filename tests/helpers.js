// Utilities shared by the tests.
// IMPORTANT: the tests DROP and recreate the tables. That is why they never use
// the development database: they use TEST_DATABASE_URL or, if it is not set,
// the same DATABASE_URL with the suffix "_test" in the database name.
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function testDatabaseUrl() {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  if (!process.env.DATABASE_URL) {
    throw new Error("Define TEST_DATABASE_URL or DATABASE_URL in .env to run the tests.");
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `${url.pathname.replace(/_test$/, "")}_test`;
  return url.toString();
}

export const TEST_DATABASE_URL = testDatabaseUrl();
if (!new URL(TEST_DATABASE_URL).pathname.endsWith("_test")) {
  throw new Error("For safety, the test database name must end in _test.");
}

// The configuration is read on import: the environment must be set BEFORE
// loading the application, which is why dynamic import() is used.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = TEST_DATABASE_URL;
delete process.env.POSTGRES_DB;

const { default: app } = await import("../backend/app.js");
const { default: pool } = await import("../backend/db/pool.js");
const { resetDatabase } = await import("../backend/db/init.js");

export { pool };

// Starts the application on a free port with a freshly reset database.
export async function start() {
  await resetDatabase({ seed: true });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const url = `http://127.0.0.1:${server.address().port}`;

  const token = async ({ role = "staff", mfa = true, sub = "1" } = {}) => {
    const r = await fetch(`${url}/auth/dev-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, mfa, sub }),
    });
    return (await r.json()).token;
  };

  // API request: returns { status, body, headers }.
  const api = async (method, route, { body, withToken } = {}) => {
    const headers = {};
    if (withToken) headers.Authorization = `Bearer ${withToken}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const r = await fetch(`${url}${route}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    return { status: r.status, body: parsed, headers: r.headers };
  };

  const close = () => new Promise((resolve) => server.close(resolve));
  return { url, token, api, close };
}

export async function finish(context) {
  await context?.close();
  await pool.end();
}

export const read = (relative) => readFile(path.join(ROOT, relative), "utf8");

// Runs the server as a separate process with the given environment and
// returns { code, output } (to test the configuration, H12 and ADR-05).
export function runServer(environment, waitMs = 1500) {
  return new Promise((resolve) => {
    const env = { PATH: process.env.PATH, DATABASE_URL: TEST_DATABASE_URL, PORT: "0", ...environment };
    const child = spawn(process.execPath, ["backend/server.js"], { cwd: ROOT, env });
    let output = "";
    child.stdout.on("data", (d) => { output += d; });
    child.stderr.on("data", (d) => { output += d; });
    const timer = setTimeout(() => child.kill(), waitMs);
    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
}
