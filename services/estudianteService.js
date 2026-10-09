import { getAllEstudiantes, insertEstudiante } from "../models/estudianteModel.js";

const getEstudiantes = async () => {
  return await getAllEstudiantes();
};

const createEstudiante = async (data) => {
  const { nombre, carrera, semestre } = data;
  return await insertEstudiante(nombre, carrera, semestre);
};

export {
  getEstudiantes,
  createEstudiante
};
