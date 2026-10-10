// Errores de negocio con su código HTTP (H08). Los servicios lanzan estos
// errores y el manejador central (middlewares/errorHandler.js) los traduce.
export class AppError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export const noEncontrado = (mensaje) => new AppError(404, mensaje);
export const conflicto = (mensaje) => new AppError(409, mensaje);
export const invalido = (mensaje) => new AppError(422, mensaje);
export const prohibido = (mensaje) => new AppError(403, mensaje);
export const noAutenticado = (mensaje) => new AppError(401, mensaje);
