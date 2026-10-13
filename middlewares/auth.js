import { jwtVerify, createRemoteJWKSet } from "jose";
import { config } from "../backend/config/config.js";
import { unauthenticated, forbidden } from "../errors/AppError.js";

// ADR-06: OAuth 2.0 + OpenID Connect with step-up MFA and roles.
// - Production: the token is signed by the identity provider and verified with
//   its public keys (JWKS), checking issuer and audience.
// - Development: the token is signed by /auth/dev-token with a local secret.
const verify = config.auth.mode === "oidc"
  ? (() => {
      const jwks = createRemoteJWKSet(new URL(config.auth.oidc.jwksUri));
      return (token) => jwtVerify(token, jwks, {
        issuer: config.auth.oidc.issuer,
        audience: config.auth.oidc.audience,
      });
    })()
  : (() => {
      const secret = new TextEncoder().encode(config.auth.devSecret);
      return (token) => jwtVerify(token, secret, { algorithms: ["HS256"] });
    })();

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    return next(unauthenticated("Token not provided."));
  }
  try {
    const { payload } = await verify(header.slice(7));
    req.user = payload;
    next();
  } catch {
    next(unauthenticated("Invalid or expired token."));
  }
};

export const allow = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(forbidden("Access denied: insufficient role."));
  }
  next();
};

// Step-up MFA: operations that modify data require the session to have been
// authenticated with a second factor. In OIDC this arrives in the standard
// "amr" claim; in development, in the "mfa" claim.
export const requireMfa = (req, res, next) => {
  const amr = Array.isArray(req.user?.amr) ? req.user.amr : [];
  if (req.user?.mfa === true || amr.includes("mfa")) return next();
  next(unauthenticated("Multi-factor authentication (MFA) is required."));
};
