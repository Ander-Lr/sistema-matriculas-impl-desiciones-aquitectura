import express from "express";
import * as estudianteController from "../controllers/estudianteController.js";
import { validateEstudiante } from "../validators/estudianteValidator.js";
import { autenticar, permitir, exigirMfa } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", autenticar, permitir("administrativo", "estudiante"), estudianteController.getEstudiantes);
router.post("/", autenticar, permitir("administrativo"), exigirMfa, validateEstudiante, estudianteController.createEstudiante);

export default router;
