import pool from '../backend/db/pool.js';

const getAllEstudiantes = async () => {
  const result = await pool.query('SELECT * FROM estudiantes');
  return result.rows;
};

const getEstudianteById = async (id) => {
  const result = await pool.query('SELECT * FROM estudiantes WHERE id = $1', [id]);
  return result.rows[0];
};

const insertEstudiante = async (nombre, carrera, semestre) => {
  const result = await pool.query(
    'INSERT INTO estudiantes (nombre, carrera, semestre) VALUES ($1, $2, $3) RETURNING *',
    [nombre, carrera, semestre]
  );
  return result.rows[0];
};

export { getAllEstudiantes, getEstudianteById, insertEstudiante };
