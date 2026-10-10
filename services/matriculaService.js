import { leerPaginacion } from "../validators/comun.js";
import { getAllMatriculasDetalladas, checkMatriculaExists, insertMatricula } from "../models/matriculaModel.js";
import { getEstudianteById } from "../models/estudianteModel.js";
import { getCursoForUpdate, decrementCupos } from "../models/cursoModel.js";
import { noEncontrado, conflicto, prohibido } from "../errors/AppError.js";
import pool from "../backend/db/pool.js";

const getMatriculas = async (query = {}) => {
  const { q, limit, offset } = leerPaginacion(query);
  return await getAllMatriculasDetalladas(q, limit, offset);
};

// Regla de negocio: un estudiante solo puede matricularse a sí mismo.
// El personal administrativo puede matricular a cualquiera.
const verificarPropietario = (usuario, estudianteId) => {
  if (usuario?.rol === "estudiante" && String(usuario.sub) !== String(estudianteId)) {
    throw prohibido("Un estudiante solo puede registrar su propia matrícula.");
  }
};

const createMatricula = async ({ estudianteId, cursoId }, usuario) => {
  verificarPropietario(usuario, estudianteId);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const estudiante = await getEstudianteById(estudianteId, client);
    if (!estudiante) throw noEncontrado("Estudiante no encontrado.");

    // Bloquea la fila del curso hasta el COMMIT: dos matrículas simultáneas
    // al último cupo se ejecutan una tras otra, nunca a la vez (H04).
    const curso = await getCursoForUpdate(cursoId, client);
    if (!curso) throw noEncontrado("Curso no encontrado.");
    if (curso.cupos <= 0) throw conflicto("No hay cupos disponibles para este curso.");

    if (await checkMatriculaExists(estudianteId, cursoId, client)) {
      throw conflicto("El estudiante ya está matriculado en el curso.");
    }

    const nuevaMatricula = await insertMatricula(estudianteId, cursoId, client);
    await decrementCupos(cursoId, client);

    await client.query("COMMIT");
    return nuevaMatricula;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { getMatriculas, createMatricula };
