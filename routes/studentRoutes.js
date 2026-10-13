import express from "express";
import * as studentController from "../controllers/studentController.js";
import { validateStudent } from "../validators/studentValidator.js";
import { authenticate, allow, requireMfa } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, allow("staff", "student"), studentController.getStudents);
router.post("/", authenticate, allow("staff"), requireMfa, validateStudent, studentController.createStudent);

export default router;
