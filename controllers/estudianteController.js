import * as estudianteService from "../services/estudianteService.js";

const getEstudiantes = async (req, res) => {
  const estudiantes = await estudianteService.getEstudiantes();
  res.json(estudiantes);
};

const createEstudiante = async (req, res) => {
  try {
    const estudiante = await estudianteService.createEstudiante(req.body);
    res.status(201).json(estudiante);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { 
  getEstudiantes,
  createEstudiante
 };
