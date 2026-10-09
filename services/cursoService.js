const { cursos } = require("../models/cursoModel");

const getCursos = () => {
  return cursos;
};

const createCurso = (data) => {
  const { nombre, docente, cupos } = data;
  const curso = {
    id: cursos.length
      ? Math.max(...cursos.map(c => c.id)) + 1
      : 1,
    nombre,
    docente,
    cupos: Number(cupos)
  };
  cursos.push(curso);
  return curso;
};

module.exports = {
  getCursos,
  createCurso
};
