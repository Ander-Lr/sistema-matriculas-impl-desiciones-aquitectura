const express = require("express");
const router = express.Router();
const matriculaController = require("../controllers/matriculaController");

router.get("/", matriculaController.getMatriculas);
router.post("/", matriculaController.createMatricula);

module.exports = router;
