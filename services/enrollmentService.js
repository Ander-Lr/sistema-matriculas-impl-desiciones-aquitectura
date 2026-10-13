import { readPagination } from "../validators/common.js";
import { getAllEnrollmentsDetailed, enrollmentExists, insertEnrollment } from "../models/enrollmentModel.js";
import { getStudentById } from "../models/studentModel.js";
import { getCourseForUpdate, decrementSeats } from "../models/courseModel.js";
import { notFound, conflict, forbidden } from "../errors/AppError.js";
import pool from "../backend/db/pool.js";

const getEnrollments = async (query = {}) => {
  const { q, limit, offset } = readPagination(query);
  return getAllEnrollmentsDetailed(q, limit, offset);
};

// Business rule: a student can only enroll themselves.
// Administrative staff can enroll anyone.
const checkOwnership = (user, studentId) => {
  if (user?.role === "student" && String(user.sub) !== String(studentId)) {
    throw forbidden("A student can only register their own enrollment.");
  }
};

const createEnrollment = async ({ studentId, courseId }, user) => {
  checkOwnership(user, studentId);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const student = await getStudentById(studentId, client);
    if (!student) throw notFound("Student not found.");

    // Locks the course row until COMMIT: two simultaneous enrollments for the
    // last seat run one after the other, never at the same time (H04).
    const course = await getCourseForUpdate(courseId, client);
    if (!course) throw notFound("Course not found.");
    if (course.seats <= 0) throw conflict("No seats available for this course.");

    if (await enrollmentExists(studentId, courseId, client)) {
      throw conflict("The student is already enrolled in this course.");
    }

    const enrollment = await insertEnrollment(studentId, courseId, client);
    await decrementSeats(courseId, client);

    await client.query("COMMIT");
    return enrollment;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { getEnrollments, createEnrollment };
