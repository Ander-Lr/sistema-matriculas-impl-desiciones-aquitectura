import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "../routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Rutas de la API
app.use("/api", apiRoutes);

export default app;
