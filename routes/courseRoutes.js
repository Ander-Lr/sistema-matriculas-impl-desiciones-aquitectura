import express from "express";
import * as courseController from "../controllers/courseController.js";
import { validateCourse } from "../validators/courseValidator.js";
import { authenticate, allow, requireMfa } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, allow("staff", "student"), courseController.getCourses);
router.post("/", authenticate, allow("staff"), requireMfa, validateCourse, courseController.createCourse);

export default router;
