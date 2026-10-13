import pool from "../backend/db/pool.js";

const getAllCourses = async (q = "", limit = 20, offset = 0) => {
  const result = await pool.query(
    "SELECT * FROM courses WHERE name ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
    [`%${q}%`, limit, offset]
  );
  return result.rows;
};

const getCourseById = async (id, client = pool) => {
  const result = await client.query("SELECT * FROM courses WHERE id = $1", [id]);
  return result.rows[0];
};

// FOR UPDATE locks the row until the transaction ends (H04).
const getCourseForUpdate = async (id, client) => {
  const result = await client.query("SELECT * FROM courses WHERE id = $1 FOR UPDATE", [id]);
  return result.rows[0];
};

const decrementSeats = async (id, client) => {
  await client.query("UPDATE courses SET seats = seats - 1 WHERE id = $1", [id]);
};

const insertCourse = async (name, instructor, seats) => {
  const result = await pool.query(
    "INSERT INTO courses (name, instructor, seats) VALUES ($1, $2, $3) RETURNING *",
    [name, instructor, seats]
  );
  return result.rows[0];
};

export { getAllCourses, getCourseById, getCourseForUpdate, decrementSeats, insertCourse };
