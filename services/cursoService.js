import { getAllCursos, insertCurso } from "../models/cursoModel.js";

const getCursos = async (query = {}) => {
  const q = query.q || "";
  const limit = parseInt(query.limit) || 10;
  const offset = parseInt(query.offset) || 0;
  return await getAllCursos(q, limit, offset);
};

const createCurso = async (data) => {
  const { nombre, docente, cupos } = data;
  return await insertCurso(nombre, docente, cupos);
};

export { getCursos, createCurso };