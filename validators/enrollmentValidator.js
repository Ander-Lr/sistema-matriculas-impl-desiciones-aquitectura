import { integer, middleware } from "./common.js";

export const validateEnrollmentData = (body) => ({
  studentId: integer(body.studentId, "studentId", 1, 2147483647),
  courseId: integer(body.courseId, "courseId", 1, 2147483647),
});

export const validateEnrollment = middleware(validateEnrollmentData);
