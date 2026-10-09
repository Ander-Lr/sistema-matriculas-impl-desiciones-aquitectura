const express = require("express");
const router = express.Router();
const estudianteController = require("../controllers/estudianteController");

router.get("/", estudianteController.getEstudiantes);
router.post("/", estudianteController.createEstudiante);

module.exports = router;
