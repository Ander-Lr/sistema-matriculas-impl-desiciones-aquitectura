import pool from '../backend/db/pool.js';

const getAllMatriculasDetalladas = async () => {
  const result = await pool.query(`
    SELECT m.id, e.nombre as estudiante, c.nombre as curso 
    FROM matriculas m
    JOIN estudiantes e ON m.estudiante_id = e.id
    JOIN cursos c ON m.curso_id = c.id
  `);
  return result.rows;
};

const checkMatriculaExists = async (estudianteId, cursoId, client = pool) => {
  const result = await client.query(
    'SELECT 1 FROM matriculas WHERE estudiante_id = $1 AND curso_id = $2',
    [estudianteId, cursoId]
  );
  return result.rowCount > 0;
};

const insertMatricula = async (estudianteId, cursoId, client = pool) => {
  const result = await client.query(
    'INSERT INTO matriculas (estudiante_id, curso_id) VALUES ($1, $2) RETURNING *',
    [estudianteId, cursoId]
  );
  return result.rows[0];
};

export { getAllMatriculasDetalladas, checkMatriculaExists, insertMatricula };
