const express = require("express");
const router = express.Router();

const estudianteRoutes = require("./estudianteRoutes");
const cursoRoutes = require("./cursoRoutes");
const matriculaRoutes = require("./matriculaRoutes");
const reporteRoutes = require("./reporteRoutes");

router.use("/estudiantes", estudianteRoutes);
router.use("/cursos", cursoRoutes);
router.use("/matriculas", matriculaRoutes);
router.use("/reporte", reporteRoutes);

module.exports = router;
