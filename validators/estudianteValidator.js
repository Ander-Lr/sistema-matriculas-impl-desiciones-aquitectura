export const validateEstudiante = (req, res, next) => {
  const { nombre, carrera, semestre } = req.body;
  if (!nombre || !carrera || semestre === undefined || isNaN(semestre) || semestre <= 0) {
    const error = new Error("Datos de estudiante inválidos o incompletos");
    error.status = 422;
    return next(error);
  }
  next();
};
