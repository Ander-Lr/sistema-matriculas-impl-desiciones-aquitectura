import { getAllMatriculasDetalladas, checkMatriculaExists, insertMatricula } from "../models/matriculaModel.js";
import { getEstudianteById } from "../models/estudianteModel.js";
import { getCursoForUpdate, decrementCupos } from "../models/cursoModel.js";
import pool from "../backend/db/pool.js";

const getMatriculas = async () => {
  return await getAllMatriculasDetalladas();
};

const createMatricula = async (data) => {
  const { estudianteId, cursoId } = data;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check si estudiante existe
    const estudiante = await getEstudianteById(estudianteId, client);
    if (!estudiante) {
      throw new Error("Estudiante no encontrado.");
    }
    
    // Bloquear curso para actualización (H04)
    const curso = await getCursoForUpdate(cursoId, client);
    if (!curso) {
      throw new Error("Curso no encontrado.");
    }
    
    if (curso.cupos <= 0) {
      throw new Error("No hay cupos disponibles para este curso.");
    }
    
    // Check si ya está matriculado
    const yaMatriculado = await checkMatriculaExists(estudianteId, cursoId, client);
    if (yaMatriculado) {
      throw new Error("El estudiante ya está matriculado en el curso.");
    }
    
    // Registrar matrícula
    const nuevaMatricula = await insertMatricula(estudianteId, cursoId, client);
    
    // Reducir cupo
    await decrementCupos(cursoId, client);
    
    await client.query('COMMIT');
    
    return nuevaMatricula;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export {
  getMatriculas,
  createMatricula
};
