import * as matriculaService from "../services/matriculaService.js";

const getMatriculas = async (req, res, next) => {
  try {
    const resultado = await matriculaService.getMatriculas(req.query);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const createMatricula = async (req, res, next) => {
  try {
    const matricula = await matriculaService.createMatricula(req.body, req.user);
    res.status(201).location(`/api/v1/matriculas/${matricula.id}`).json({ mensaje: "Matrícula registrada correctamente.", id: matricula.id });
  } catch (error) {
    next(error);
  }
};

export { getMatriculas, createMatricula };