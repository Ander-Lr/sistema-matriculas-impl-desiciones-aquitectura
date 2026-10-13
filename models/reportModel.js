import pool from "../backend/db/pool.js";

// The report is computed by PostgreSQL (JOIN + array_agg), not in a JavaScript
// loop: the Node.js process stays free to serve other requests (H10).
const getReportData = async (q = "", limit = 20, offset = 0) => {
  const result = await pool.query(
    `SELECT s.name AS student, s.program,
            COALESCE(array_agg(c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS courses
     FROM students s
     LEFT JOIN enrollments e ON s.id = e.student_id
     LEFT JOIN courses c ON e.course_id = c.id
     WHERE s.name ILIKE $1
     GROUP BY s.id, s.name, s.program
     ORDER BY s.id DESC LIMIT $2 OFFSET $3`,
    [`%${q}%`, limit, offset]
  );
  return result.rows;
};

export { getReportData };
