import * as cursoService from "../services/cursoService.js";

const getCursos = async (req, res, next) => {
  try {
    const cursos = await cursoService.getCursos(req.query);
    res.json(cursos);
  } catch (err) {
    next(err);
  }
};

const createCurso = async (req, res, next) => {
  try {
    const curso = await cursoService.createCurso(req.body);
    res.status(201).location(`/api/v1/cursos/${curso.id}`).json(curso);
  } catch (error) {
    next(error);
  }
};

export { getCursos, createCurso };