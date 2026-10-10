// Utilidades de validación compartidas (H03, H14).
import { invalido } from "../errors/AppError.js";

export const texto = (valor, campo, max = 120) => {
  if (typeof valor !== "string" || !valor.trim()) throw invalido(`El campo "${campo}" es obligatorio.`);
  if (valor.trim().length > max) throw invalido(`El campo "${campo}" admite máximo ${max} caracteres.`);
  return valor.trim();
};

export const entero = (valor, campo, min, max) => {
  const n = typeof valor === "string" && valor.trim() !== "" ? Number(valor) : valor;
  if (!Number.isInteger(n) || n < min || n > max) {
    throw invalido(`El campo "${campo}" debe ser un entero entre ${min} y ${max}.`);
  }
  return n;
};

// Paginación y búsqueda: ?q=texto&limit=20&offset=0. El límite tiene tope para
// que nadie pueda pedir la tabla completa de una sola vez (H09, H14).
export const leerPaginacion = (query = {}) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  return { q, limit, offset };
};

// Envuelve una función de validación como middleware: deja en req.body solo
// los campos limpios y convertidos.
export const middleware = (validar) => (req, res, next) => {
  try {
    req.body = validar(req.body ?? {});
    next();
  } catch (error) {
    next(error);
  }
};
