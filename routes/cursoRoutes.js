import express from "express";
const router = express.Router();
import * as cursoController from "../controllers/cursoController.js";

router.get("/", cursoController.getCursos);
router.post("/", cursoController.createCurso);

export default router;
