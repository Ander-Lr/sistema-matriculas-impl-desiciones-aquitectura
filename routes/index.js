import express from "express";
const router = express.Router();

import estudianteRoutes from "./estudianteRoutes.js";
import cursoRoutes from "./cursoRoutes.js";
import matriculaRoutes from "./matriculaRoutes.js";
import reporteRoutes from "./reporteRoutes.js";

router.use("/estudiantes", estudianteRoutes);
router.use("/cursos", cursoRoutes);
router.use("/matriculas", matriculaRoutes);
router.use("/reporte", reporteRoutes);

export default router;
