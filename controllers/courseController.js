import * as courseService from "../services/courseService.js";

const getCourses = async (req, res, next) => {
  try {
    res.json(await courseService.getCourses(req.query));
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).location(`/api/v1/courses/${course.id}`).json(course);
  } catch (error) {
    next(error);
  }
};

export { getCourses, createCourse };
