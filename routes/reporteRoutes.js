import express from "express";
import { autenticar, permitir } from "../middlewares/auth.js";

const router = express.Router();
import * as reporteController from "../controllers/reporteController.js";

router.get("/", autenticar, permitir("administrativo"), reporteController.getReporte);

export default router;
