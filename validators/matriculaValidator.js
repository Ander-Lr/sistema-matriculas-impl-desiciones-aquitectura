import { entero, middleware } from "./comun.js";

export const validarMatricula = (body) => ({
  estudianteId: entero(body.estudianteId, "estudianteId", 1, 2147483647),
  cursoId: entero(body.cursoId, "cursoId", 1, 2147483647),
});

export const validateMatricula = middleware(validarMatricula);
