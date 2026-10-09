import express from "express";
const router = express.Router();
import * as estudianteController from "../controllers/estudianteController.js";

router.get("/", estudianteController.getEstudiantes);
router.post("/", estudianteController.createEstudiante);

export default router;
