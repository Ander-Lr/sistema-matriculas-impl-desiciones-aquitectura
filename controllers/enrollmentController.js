import * as enrollmentService from "../services/enrollmentService.js";

const getEnrollments = async (req, res, next) => {
  try {
    res.json(await enrollmentService.getEnrollments(req.query));
  } catch (error) {
    next(error);
  }
};

const createEnrollment = async (req, res, next) => {
  try {
    // req.user is passed so the service can apply the ownership rule (ADR-06).
    const enrollment = await enrollmentService.createEnrollment(req.body, req.user);
    res.status(201)
      .location(`/api/v1/enrollments/${enrollment.id}`)
      .json({ message: "Enrollment registered successfully.", id: enrollment.id });
  } catch (error) {
    next(error);
  }
};

export { getEnrollments, createEnrollment };
