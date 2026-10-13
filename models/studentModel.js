import pool from "../backend/db/pool.js";

// MODEL (MVC): the only layer that contains SQL. All queries are parameterized.
const getAllStudents = async (q = "", limit = 20, offset = 0) => {
  const result = await pool.query(
    "SELECT * FROM students WHERE name ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
    [`%${q}%`, limit, offset]
  );
  return result.rows;
};

const getStudentById = async (id, client = pool) => {
  const result = await client.query("SELECT * FROM students WHERE id = $1", [id]);
  return result.rows[0];
};

const insertStudent = async (name, program, semester) => {
  const result = await pool.query(
    "INSERT INTO students (name, program, semester) VALUES ($1, $2, $3) RETURNING *",
    [name, program, semester]
  );
  return result.rows[0];
};

export { getAllStudents, getStudentById, insertStudent };
