import express from "express";
const router = express.Router();
import * as reporteController from "../controllers/reporteController.js";

router.get("/", reporteController.getReporte);

export default router;
