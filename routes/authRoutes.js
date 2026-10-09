import express from "express";
import { SignJWT } from "jose";

const router = express.Router();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'mi_secreto_super_seguro_para_jose_123');

router.post("/dev-token", async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Ruta deshabilitada en producción" });
  }

  const { rol = "estudiante", mfa = false, sub = "1" } = req.body;

  try {
    const token = await new SignJWT({ rol, mfa })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(JWT_SECRET);

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
