import { errorHandler } from "../middlewares/errorHandler.js";
import express from "express";
import helmet from "helmet";
import authRoutes from "../routes/authRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "../routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Rutas de la API
app.use("/auth", authRoutes);
app.use("/api/v1", apiRoutes);

app.use(errorHandler);

export default app;
