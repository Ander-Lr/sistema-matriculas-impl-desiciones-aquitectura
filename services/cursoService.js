import { getAllCursos, insertCurso } from "../models/cursoModel.js";

const getCursos = async () => {
  return await getAllCursos();
};

const createCurso = async (data) => {
  const { nombre, docente, cupos } = data;
  return await insertCurso(nombre, docente, cupos);
};

export {
  getCursos,
  createCurso
};
