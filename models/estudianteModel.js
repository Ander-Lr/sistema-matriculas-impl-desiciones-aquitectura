import pool from "../backend/db/pool.js";

const getAllEstudiantes = async (q = "", limit = 10, offset = 0) => {
  const result = await pool.query(
    "SELECT * FROM estudiantes WHERE nombre ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
    [`%${q}%`, limit, offset]
  );
  return result.rows;
};

const getEstudianteById = async (id, client = pool) => {
  const result = await client.query("SELECT * FROM estudiantes WHERE id = $1", [id]);
  return result.rows[0];
};

const insertEstudiante = async (nombre, carrera, semestre) => {
  const result = await pool.query(
    "INSERT INTO estudiantes (nombre, carrera, semestre) VALUES ($1, $2, $3) RETURNING *",
    [nombre, carrera, semestre]
  );
  return result.rows[0];
};

export { getAllEstudiantes, getEstudianteById, insertEstudiante };
