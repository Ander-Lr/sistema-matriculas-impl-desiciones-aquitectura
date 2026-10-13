import express from "express";
import * as enrollmentController from "../controllers/enrollmentController.js";
import { validateEnrollment } from "../validators/enrollmentValidator.js";
import { authenticate, allow, requireMfa } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, allow("staff", "student"), enrollmentController.getEnrollments);
router.post("/", authenticate, allow("staff", "student"), requireMfa, validateEnrollment, enrollmentController.createEnrollment);

export default router;
