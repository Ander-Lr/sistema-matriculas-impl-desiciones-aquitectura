const matriculaService = require("../services/matriculaService");

const getMatriculas = (req, res) => {
  const resultado = matriculaService.getMatriculas();
  res.json(resultado);
};

const createMatricula = (req, res) => {
  try {
    matriculaService.createMatricula(req.body);
    res.status(201).json({ mensaje: "Matrícula registrada correctamente." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getMatriculas,
  createMatricula
};
