import { text, integer, middleware } from "./common.js";

export const validateStudentData = (body) => ({
  name: text(body.name, "name"),
  program: text(body.program, "program"),
  semester: integer(body.semester, "semester", 1, 12),
});

export const validateStudent = middleware(validateStudentData);
