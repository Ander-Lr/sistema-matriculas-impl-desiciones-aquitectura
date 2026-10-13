import express from "express";
import studentRoutes from "./studentRoutes.js";
import courseRoutes from "./courseRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = express.Router();

router.use("/students", studentRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/report", reportRoutes);

export default router;
