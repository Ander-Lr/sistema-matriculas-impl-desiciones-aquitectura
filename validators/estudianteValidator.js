import { texto, entero, middleware } from "./comun.js";

export const validarEstudiante = (body) => ({
  nombre: texto(body.nombre, "nombre"),
  carrera: texto(body.carrera, "carrera"),
  semestre: entero(body.semestre, "semestre", 1, 12),
});

export const validateEstudiante = middleware(validarEstudiante);
