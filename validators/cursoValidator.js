export const validateCurso = (req, res, next) => {
  const { nombre, docente, cupos } = req.body;
  if (!nombre || !docente || cupos === undefined || isNaN(cupos) || cupos < 0) {
    const error = new Error("Datos de curso inválidos o incompletos");
    error.status = 422;
    return next(error);
  }
  next();
};
