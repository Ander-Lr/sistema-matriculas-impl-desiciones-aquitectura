// Central configuration (H12): every value that changes between environments
// comes from environment variables. If something required is missing, the
// server does NOT start and explains why, instead of failing later.

const environment = process.env.NODE_ENV ?? "development";
const isProduction = environment === "production";
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error(`Invalid PORT: "${process.env.PORT}"`);
}

// Database: DATABASE_URL is accepted or, for compatibility, the POSTGRES_* variables.
const databaseUrl = process.env.DATABASE_URL
  ?? (process.env.POSTGRES_DB
    ? `postgres://${process.env.POSTGRES_USER ?? "app_user"}:${process.env.POSTGRES_PASSWORD ?? ""}`
      + `@${process.env.DB_HOST ?? "localhost"}:${process.env.DB_PORT ?? 5432}/${process.env.POSTGRES_DB}`
    : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing (see .env.example).");
}

// Authentication (ADR-06). In production, tokens are issued by the identity
// provider (OAuth 2.0 + OpenID Connect) and verified with its public keys
// (JWKS). In development they are signed with a local secret via /auth/dev-token.
const oidc = {
  issuer: process.env.OIDC_ISSUER,
  audience: process.env.OIDC_AUDIENCE,
  jwksUri: process.env.OIDC_JWKS_URI,
};

if (isProduction) {
  const missing = Object.entries({
    OIDC_ISSUER: oidc.issuer,
    OIDC_AUDIENCE: oidc.audience,
    OIDC_JWKS_URI: oidc.jwksUri,
  }).filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Production without an identity provider configured. Missing: ${missing.join(", ")}`);
  }
  if (process.env.ALLOW_DEV_TOKEN === "true") {
    throw new Error("ALLOW_DEV_TOKEN cannot be enabled in production.");
  }
}

export const config = Object.freeze({
  environment,
  isProduction,
  port,
  host: process.env.HOST ?? "127.0.0.1",
  databaseUrl,
  auth: Object.freeze({
    mode: isProduction ? "oidc" : "dev",
    oidc: Object.freeze(oidc),
    devSecret: process.env.JWT_SECRET ?? "development-only-change-me",
    allowDevToken: !isProduction,
  }),
});
