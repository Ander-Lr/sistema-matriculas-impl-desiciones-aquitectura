const cursoService = require("../services/cursoService");

const getCursos = (req, res) => {
  const cursos = cursoService.getCursos();
  res.json(cursos);
};

const createCurso = (req, res) => {
  try {
    const curso = cursoService.createCurso(req.body);
    res.status(201).json(curso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCursos,
  createCurso
};
