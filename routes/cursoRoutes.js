const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/cursoController");

router.get("/", cursoController.getCursos);
router.post("/", cursoController.createCurso);

module.exports = router;
