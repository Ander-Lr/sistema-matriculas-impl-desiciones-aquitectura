import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/config.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import authRoutes from "../routes/authRoutes.js";
import apiRoutes from "../routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const app = express();

// Behind Nginx (ADR-05): trust the X-Forwarded-For header from the local proxy.
if (config.isProduction) app.set("trust proxy", "loopback");

// Security headers, including a Content-Security-Policy that only allows
// scripts from this server (reinforces the XSS defense, H05).
app.use(helmet());
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// Bootstrap served from node_modules: no CDN, no Internet dependency and
// compatible with helmet's CSP (ADR-07).
app.use("/vendor/bootstrap", express.static(path.join(root, "node_modules/bootstrap/dist")));

// View (MVC): frontend files
app.use(express.static(path.join(root, "frontend")));

// Identity provider simulator: only outside production (ADR-06)
if (config.auth.allowDevToken) {
  app.use("/auth", authRoutes);
}

// Versioned API (ADR-04)
app.use("/api/v1", apiRoutes);
app.use("/api", (req, res) => res.status(404).json({ error: "Resource not found." }));

app.use(errorHandler);

export default app;
