import pool from '../backend/db/pool.js';

const getReporteData = async () => {
  const result = await pool.query(`
    SELECT e.nombre as estudiante, e.carrera, COALESCE(array_agg(c.nombre) FILTER (WHERE c.nombre IS NOT NULL), '{}') as cursos
    FROM estudiantes e
    LEFT JOIN matriculas m ON e.id = m.estudiante_id
    LEFT JOIN cursos c ON m.curso_id = c.id
    GROUP BY e.id, e.nombre, e.carrera
  `);
  return result.rows;
};

export { getReporteData };
