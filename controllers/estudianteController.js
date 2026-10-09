import * as estudianteService from "../services/estudianteService.js";

const getEstudiantes = async (req, res, next) => {
  try {
    const estudiantes = await estudianteService.getEstudiantes(req.query);
    res.json(estudiantes);
  } catch (err) {
    next(err);
  }
};

const createEstudiante = async (req, res, next) => {
  try {
    const estudiante = await estudianteService.createEstudiante(req.body);
    res.status(201).location(`/api/v1/estudiantes/${estudiante.id}`).json(estudiante);
  } catch (error) {
    next(error);
  }
};

export { getEstudiantes, createEstudiante };