import { leerPaginacion } from "../validators/comun.js";
import { getAllCursos, insertCurso } from "../models/cursoModel.js";

const getCursos = async (query = {}) => {
  const { q, limit, offset } = leerPaginacion(query);
  return await getAllCursos(q, limit, offset);
};

const createCurso = async (data) => {
  const { nombre, docente, cupos } = data;
  return await insertCurso(nombre, docente, cupos);
};

export { getCursos, createCurso };