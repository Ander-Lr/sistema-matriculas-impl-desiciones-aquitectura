export const validateMatricula = (req, res, next) => {
  const { estudianteId, cursoId } = req.body;
  if (!estudianteId || !cursoId || isNaN(estudianteId) || isNaN(cursoId)) {
    const error = new Error("ID de estudiante o curso inválidos");
    error.status = 422;
    return next(error);
  }
  next();
};
