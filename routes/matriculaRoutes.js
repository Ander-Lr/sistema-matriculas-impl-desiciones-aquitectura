import express from "express";
const router = express.Router();
import * as matriculaController from "../controllers/matriculaController.js";

router.get("/", matriculaController.getMatriculas);
router.post("/", matriculaController.createMatricula);

export default router;
