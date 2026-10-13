import pg from "pg";
import { config } from "../config/config.js";

const { Pool } = pg;

// A single connection pool for the whole application (ADR-03). The connection
// string comes from the configuration (H12), never hard-coded.
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export default pool;
