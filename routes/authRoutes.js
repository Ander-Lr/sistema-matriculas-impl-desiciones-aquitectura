import express from "express";
import { SignJWT } from "jose";
import { config } from "../backend/config/config.js";

// Simulates the identity provider ONLY in development (ADR-06).
// app.js does not even mount this router when NODE_ENV=production.
const router = express.Router();
const secret = new TextEncoder().encode(config.auth.devSecret);
const ROLES = ["student", "staff"];

router.post("/dev-token", async (req, res, next) => {
  if (!config.auth.allowDevToken) {
    return res.status(404).json({ error: "Not available." });
  }

  const { role = "student", mfa = false, sub = "1", name } = req.body ?? {};
  if (!ROLES.includes(role)) {
    return res.status(422).json({ error: `Invalid role. Use: ${ROLES.join(", ")}` });
  }

  try {
    const token = await new SignJWT({ role, mfa: mfa === true, name: name ?? `User ${sub}` })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(sub))
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
