import express from "express";
import * as matriculaController from "../controllers/matriculaController.js";
import { validateMatricula } from "../validators/matriculaValidator.js";
import { autenticar, permitir, exigirMfa } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", autenticar, permitir("administrativo", "estudiante"), matriculaController.getMatriculas);
router.post("/", autenticar, permitir("administrativo", "estudiante"), exigirMfa, validateMatricula, matriculaController.createMatricula);

export default router;
