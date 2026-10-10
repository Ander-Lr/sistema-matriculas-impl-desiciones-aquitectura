import express from "express";
import { SignJWT } from "jose";
import { config } from "../backend/config/config.js";

// Simula al proveedor de identidad SOLO en desarrollo (ADR-06).
// app.js ni siquiera monta este router cuando NODE_ENV=production.
const router = express.Router();
const secreto = new TextEncoder().encode(config.auth.devSecret);
const ROLES = ["estudiante", "administrativo"];

router.post("/dev-token", async (req, res, next) => {
  if (!config.auth.permitirDevToken) {
    return res.status(404).json({ error: "No disponible." });
  }

  const { rol = "estudiante", mfa = false, sub = "1", nombre } = req.body ?? {};
  if (!ROLES.includes(rol)) {
    return res.status(422).json({ error: `Rol inválido. Use: ${ROLES.join(", ")}` });
  }

  try {
    const token = await new SignJWT({ rol, mfa: mfa === true, nombre: nombre ?? `Usuario ${sub}` })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(sub))
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secreto);

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
