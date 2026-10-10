import { jwtVerify, createRemoteJWKSet } from "jose";
import { config } from "../backend/config/config.js";
import { noAutenticado, prohibido } from "../errors/AppError.js";

// ADR-06: OAuth 2.0 + OpenID Connect con MFA escalonada y roles.
// - Producción: el token lo firma el proveedor de identidad y se verifica con
//   sus claves públicas (JWKS), comprobando emisor y audiencia.
// - Desarrollo: el token lo firma /auth/dev-token con un secreto local.
const verificar = config.auth.modo === "oidc"
  ? (() => {
      const jwks = createRemoteJWKSet(new URL(config.auth.oidc.jwksUri));
      return (token) => jwtVerify(token, jwks, {
        issuer: config.auth.oidc.issuer,
        audience: config.auth.oidc.audience,
      });
    })()
  : (() => {
      const secreto = new TextEncoder().encode(config.auth.devSecret);
      return (token) => jwtVerify(token, secreto, { algorithms: ["HS256"] });
    })();

export const autenticar = async (req, res, next) => {
  const authHeader = req.headers.authorization ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return next(noAutenticado("Token no proporcionado."));
  }
  try {
    const { payload } = await verificar(authHeader.slice(7));
    req.user = payload;
    next();
  } catch {
    next(noAutenticado("Token inválido o expirado."));
  }
};

export const permitir = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return next(prohibido("Acceso denegado: rol insuficiente."));
  }
  next();
};

// MFA escalonada (step-up): las operaciones que modifican datos exigen que la
// sesión se haya autenticado con un segundo factor. En OIDC esto llega en el
// claim estándar "amr"; en desarrollo, en el claim "mfa".
export const exigirMfa = (req, res, next) => {
  const amr = Array.isArray(req.user?.amr) ? req.user.amr : [];
  if (req.user?.mfa === true || amr.includes("mfa")) return next();
  next(noAutenticado("Se requiere autenticación multifactor (MFA)."));
};
