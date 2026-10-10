import { leerPaginacion } from "../validators/comun.js";
import { getAllEstudiantes, insertEstudiante } from "../models/estudianteModel.js";

const getEstudiantes = async (query = {}) => {
  const { q, limit, offset } = leerPaginacion(query);
  return await getAllEstudiantes(q, limit, offset);
};

const createEstudiante = async (data) => {
  const { nombre, carrera, semestre } = data;
  return await insertEstudiante(nombre, carrera, semestre);
};

export { getEstudiantes, createEstudiante };