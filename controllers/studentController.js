import * as studentService from "../services/studentService.js";

const getStudents = async (req, res, next) => {
  try {
    res.json(await studentService.getStudents(req.query));
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).location(`/api/v1/students/${student.id}`).json(student);
  } catch (error) {
    next(error);
  }
};

export { getStudents, createStudent };
