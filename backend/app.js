import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/config.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import authRoutes from "../routes/authRoutes.js";
import apiRoutes from "../routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");

const app = express();

// Detrás de Nginx (ADR-05): confiar en la cabecera X-Forwarded-For del proxy local.
if (config.esProduccion) app.set("trust proxy", "loopback");

// Cabeceras de seguridad, incluida la Content-Security-Policy que solo permite
// scripts del propio servidor (refuerza la defensa contra XSS, H05).
app.use(helmet());
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// Bootstrap servido desde node_modules: sin CDN, sin depender de Internet y
// compatible con la CSP de helmet (ADR-07).
app.use("/vendor/bootstrap", express.static(path.join(raiz, "node_modules/bootstrap/dist")));

// Vista (MVC): archivos del frontend
app.use(express.static(path.join(raiz, "frontend")));

// Simulador del proveedor de identidad: solo fuera de producción (ADR-06)
if (config.auth.permitirDevToken) {
  app.use("/auth", authRoutes);
}

// API versionada (ADR-04)
app.use("/api/v1", apiRoutes);
app.use("/api", (req, res) => res.status(404).json({ error: "Recurso no encontrado." }));

app.use(errorHandler);

export default app;
