const estudianteService = require("../services/estudianteService");

const getEstudiantes = (req, res) => {
  const estudiantes = estudianteService.getEstudiantes();
  res.json(estudiantes);
};

const createEstudiante = (req, res) => {
  try {
    const estudiante = estudianteService.createEstudiante(req.body);
    res.status(201).json(estudiante);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getEstudiantes,
  createEstudiante
};
