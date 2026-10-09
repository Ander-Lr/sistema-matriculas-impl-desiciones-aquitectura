const { estudiantes } = require("../models/estudianteModel");

const getEstudiantes = () => {
  return estudiantes;
};

const createEstudiante = (data) => {
  const { nombre, carrera, semestre } = data;
  const estudiante = {
    id: estudiantes.length
      ? Math.max(...estudiantes.map(e => e.id)) + 1
      : 1,
    nombre,
    carrera,
    semestre: Number(semestre)
  };
  estudiantes.push(estudiante);
  return estudiante;
};

module.exports = {
  getEstudiantes,
  createEstudiante
};
