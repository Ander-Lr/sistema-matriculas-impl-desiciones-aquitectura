import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'app_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'app_db',
  password: process.env.POSTGRES_PASSWORD || 'mysecretpassword',
  port: process.env.DB_PORT || 5432,
});

export default pool;
