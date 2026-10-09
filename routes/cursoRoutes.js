import express from "express";
import * as cursoController from "../controllers/cursoController.js";
import { validateCurso } from "../validators/cursoValidator.js";
import { autenticar, permitir, exigirMfa } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", autenticar, permitir("administrativo", "estudiante"), cursoController.getCursos);
router.post("/", autenticar, permitir("administrativo"), exigirMfa, validateCurso, cursoController.createCurso);

export default router;
