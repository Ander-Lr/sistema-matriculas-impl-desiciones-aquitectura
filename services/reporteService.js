const { estudiantes } = require("../models/estudianteModel");
const { matriculas } = require("../models/matriculaModel");
const { cursos } = require("../models/cursoModel");

const getReporte = () => {
  return estudiantes.map(estudiante => {
    const cursosEstudiante = matriculas
      .filter(m => m.estudianteId === estudiante.id)
      .map(m => {
        const curso = cursos.find(c => c.id === m.cursoId);
        return curso ? curso.nombre : "Sin curso";
      });
      
    return {
      estudiante: estudiante.nombre,
      carrera: estudiante.carrera,
      cursos: cursosEstudiante
    };
  });
};

module.exports = { getReporte };
