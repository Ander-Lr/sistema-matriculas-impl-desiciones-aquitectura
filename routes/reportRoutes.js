import express from "express";
import * as reportController from "../controllers/reportController.js";
import { authenticate, allow } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, allow("staff"), reportController.getReport);

export default router;
