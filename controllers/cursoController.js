import * as cursoService from "../services/cursoService.js";

const getCursos = async (req, res) => {
  const cursos = await cursoService.getCursos();
  res.json(cursos);
};

const createCurso = async (req, res) => {
  try {
    const curso = await cursoService.createCurso(req.body);
    res.status(201).json(curso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { 
  getCursos,
  createCurso
 };
