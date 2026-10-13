import { text, integer, middleware } from "./common.js";

export const validateCourseData = (body) => ({
  name: text(body.name, "name"),
  instructor: text(body.instructor, "instructor"),
  seats: integer(body.seats, "seats", 1, 500),
});

export const validateCourse = middleware(validateCourseData);
