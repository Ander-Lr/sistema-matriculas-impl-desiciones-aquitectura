import { texto, entero, middleware } from "./comun.js";

export const validarCurso = (body) => ({
  nombre: texto(body.nombre, "nombre"),
  docente: texto(body.docente, "docente"),
  cupos: entero(body.cupos, "cupos", 1, 500),
});

export const validateCurso = middleware(validarCurso);
