// Shared validation utilities (H03, H14).
import { invalid } from "../errors/AppError.js";

export const text = (value, field, max = 120) => {
  if (typeof value !== "string" || !value.trim()) throw invalid(`The field "${field}" is required.`);
  if (value.trim().length > max) throw invalid(`The field "${field}" allows at most ${max} characters.`);
  return value.trim();
};

export const integer = (value, field, min, max) => {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(n) || n < min || n > max) {
    throw invalid(`The field "${field}" must be an integer between ${min} and ${max}.`);
  }
  return n;
};

// Pagination and search: ?q=text&limit=20&offset=0. The limit has a cap so
// nobody can request the whole table at once (H09, H14).
export const readPagination = (query = {}) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  return { q, limit, offset };
};

// Wraps a validation function as middleware: req.body keeps only the clean,
// converted fields.
export const middleware = (validate) => (req, res, next) => {
  try {
    req.body = validate(req.body ?? {});
    next();
  } catch (error) {
    next(error);
  }
};
