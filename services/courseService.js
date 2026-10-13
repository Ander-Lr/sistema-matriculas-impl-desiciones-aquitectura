import { readPagination } from "../validators/common.js";
import { getAllCourses, insertCourse } from "../models/courseModel.js";

const getCourses = async (query = {}) => {
  const { q, limit, offset } = readPagination(query);
  return getAllCourses(q, limit, offset);
};

const createCourse = async ({ name, instructor, seats }) => insertCourse(name, instructor, seats);

export { getCourses, createCourse };
