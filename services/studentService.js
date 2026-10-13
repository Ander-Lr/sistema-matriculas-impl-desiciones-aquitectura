import { readPagination } from "../validators/common.js";
import { getAllStudents, insertStudent } from "../models/studentModel.js";

const getStudents = async (query = {}) => {
  const { q, limit, offset } = readPagination(query);
  return getAllStudents(q, limit, offset);
};

const createStudent = async ({ name, program, semester }) => insertStudent(name, program, semester);

export { getStudents, createStudent };
