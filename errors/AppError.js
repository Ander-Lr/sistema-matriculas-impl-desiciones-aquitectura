// Business errors with their HTTP status code (H08). Services throw these
// errors and the central handler (middlewares/errorHandler.js) translates them.
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = (message) => new AppError(404, message);
export const conflict = (message) => new AppError(409, message);
export const invalid = (message) => new AppError(422, message);
export const forbidden = (message) => new AppError(403, message);
export const unauthenticated = (message) => new AppError(401, message);
