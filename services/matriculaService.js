const { matriculas } = require("../models/matriculaModel");
const { estudiantes } = require("../models/estudianteModel");
const { cursos } = require("../models/cursoModel");

const getMatriculas = () => {
  return matriculas.map(m => {
    const estudiante = estudiantes.find(e => e.id === m.estudianteId);
    const curso = cursos.find(c => c.id === m.cursoId);
    return {
      id: m.id,
      estudiante: estudiante ? estudiante.nombre : "Desconocido",
      curso: curso ? curso.nombre : "Desconocido"
    };
  });
};
const createMatricula = (data) => {
  const { estudianteId, cursoId } = data;
  const estudiante = estudiantes.find(e => e.id === Number(estudianteId));
  const curso = cursos.find(c => c.id === Number(cursoId));

  if (!estudiante || !curso) {
    throw new Error("Estudiante o curso no encontrado.");
  }
  if (matriculas.some(m => m.estudianteId === estudiante.id && m.cursoId === curso.id)) {
    throw new Error("El estudiante ya está matriculado en el curso.");
  }

  const nuevaMatricula = {
    id: matriculas.length
      ? Math.max(...matriculas.map(m => m.id)) + 1
      : 1,
    estudianteId: estudiante.id,
    cursoId: curso.id
  };
  matriculas.push(nuevaMatricula);
  return nuevaMatricula;
};
module.exports = {
  getMatriculas,
  createMatricula
};
