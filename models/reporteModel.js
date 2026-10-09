import pool from "../backend/db/pool.js";

const getReporteData = async (q = "", limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT e.nombre as estudiante, e.carrera, COALESCE(array_agg(c.nombre) FILTER (WHERE c.nombre IS NOT NULL), '{}') as cursos
    FROM estudiantes e
    LEFT JOIN matriculas m ON e.id = m.estudiante_id
    LEFT JOIN cursos c ON m.curso_id = c.id
    WHERE e.nombre ILIKE $1
    GROUP BY e.id, e.nombre, e.carrera
    ORDER BY e.id DESC LIMIT $2 OFFSET $3`,
    [`%${q}%`, limit, offset]
  );
  return result.rows;
};

export { getReporteData };
