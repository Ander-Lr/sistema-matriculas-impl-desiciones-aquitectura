import * as matriculaService from "../services/matriculaService.js";

const getMatriculas = async (req, res) => {
  const resultado = await matriculaService.getMatriculas();
  res.json(resultado);
};

const createMatricula = async (req, res) => {
  try {
    await matriculaService.createMatricula(req.body);
    res.status(201).json({ mensaje: "Matrícula registrada correctamente." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { 
  getMatriculas,
  createMatricula
 };
