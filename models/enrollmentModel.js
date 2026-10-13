import pool from "../backend/db/pool.js";

const getAllEnrollmentsDetailed = async (q = "", limit = 20, offset = 0) => {
  const result = await pool.query(
    `SELECT e.id, s.name AS student, c.name AS course
     FROM enrollments e
     JOIN students s ON e.student_id = s.id
     JOIN courses c ON e.course_id = c.id
     WHERE s.name ILIKE $1 OR c.name ILIKE $1
     ORDER BY e.id DESC LIMIT $2 OFFSET $3`,
    [`%${q}%`, limit, offset]
  );
  return result.rows;
};

const enrollmentExists = async (studentId, courseId, client = pool) => {
  const result = await client.query(
    "SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2",
    [studentId, courseId]
  );
  return result.rowCount > 0;
};

const insertEnrollment = async (studentId, courseId, client = pool) => {
  const result = await client.query(
    "INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *",
    [studentId, courseId]
  );
  return result.rows[0];
};

export { getAllEnrollmentsDetailed, enrollmentExists, insertEnrollment };
