// Creates (or recreates) the tables from database/schema.sql.
// Usage: npm run db:reset   → schema + sample data (the script passes --seed)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pool from "./pool.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export async function resetDatabase({ seed = true } = {}) {
  const schema = await readFile(path.join(root, "database/schema.sql"), "utf8");
  await pool.query(schema);
  if (seed) {
    const data = await readFile(path.join(root, "database/seed.sql"), "utf8");
    await pool.query(data);
  }
}

// Runs only when called directly (not when imported by the tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await resetDatabase({ seed: process.argv.includes("--seed") });
    console.log("Database reset.");
  } catch (error) {
    console.error("Could not reset the database:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
