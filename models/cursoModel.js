import pool from '../backend/db/pool.js';

const getAllCursos = async () => {
  const result = await pool.query('SELECT * FROM cursos');
  return result.rows;
};

const getCursoById = async (id, client = pool) => {
  const result = await client.query('SELECT * FROM cursos WHERE id = $1', [id]);
  return result.rows[0];
};

const getCursoForUpdate = async (id, client) => {
  const result = await client.query('SELECT * FROM cursos WHERE id = $1 FOR UPDATE', [id]);
  return result.rows[0];
};

const decrementCupos = async (id, client) => {
  await client.query('UPDATE cursos SET cupos = cupos - 1 WHERE id = $1', [id]);
};

const insertCurso = async (nombre, docente, cupos) => {
  const result = await pool.query(
    'INSERT INTO cursos (nombre, docente, cupos) VALUES ($1, $2, $3) RETURNING *',
    [nombre, docente, cupos]
  );
  return result.rows[0];
};

export { getAllCursos, getCursoById, getCursoForUpdate, decrementCupos, insertCurso };
