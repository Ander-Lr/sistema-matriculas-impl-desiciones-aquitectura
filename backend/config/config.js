// Configuración central (H12): todo valor que cambia entre entornos sale de
// variables de entorno. Si falta algo obligatorio, el servidor NO arranca y
// explica por qué, en vez de fallar más tarde con un error confuso.

const entorno = process.env.NODE_ENV ?? 'development';
const esProduccion = entorno === 'production';
const puerto = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(puerto) || puerto < 0 || puerto > 65535) {
    throw new Error(`PORT inválido: "${process.env.PORT}"`);
}

// Base de datos: se acepta DATABASE_URL o, por compatibilidad, las variables
// POSTGRES_* que ya usaba el equipo.
const databaseUrl = process.env.DATABASE_URL
    ?? (process.env.POSTGRES_DB
        ? `postgres://${process.env.POSTGRES_USER ?? 'app_user'}:${process.env.POSTGRES_PASSWORD ?? ''}`
          + `@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.POSTGRES_DB}`
        : undefined);

if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL (ver .env.example).');
}

// Autenticación (ADR-06). En producción los tokens los emite el proveedor de
// identidad (OAuth 2.0 + OpenID Connect) y se verifican con sus claves públicas
// (JWKS). En desarrollo se firma con un secreto local y existe /auth/dev-token.
const oidc = {
    issuer: process.env.OIDC_ISSUER,
    audience: process.env.OIDC_AUDIENCE,
    jwksUri: process.env.OIDC_JWKS_URI,
};

if (esProduccion) {
    const faltantes = Object.entries({
        OIDC_ISSUER: oidc.issuer,
        OIDC_AUDIENCE: oidc.audience,
        OIDC_JWKS_URI: oidc.jwksUri,
    }).filter(([, valor]) => !valor).map(([nombre]) => nombre);

    if (faltantes.length) {
        throw new Error(`Producción sin proveedor de identidad configurado. Faltan: ${faltantes.join(', ')}`);
    }
    if (process.env.ALLOW_DEV_TOKEN === 'true') {
        throw new Error('ALLOW_DEV_TOKEN no puede activarse en producción.');
    }
}

export const config = Object.freeze({
    entorno,
    esProduccion,
    puerto,
    host: process.env.HOST ?? '127.0.0.1',
    databaseUrl,
    auth: Object.freeze({
        modo: esProduccion ? 'oidc' : 'dev',
        oidc: Object.freeze(oidc),
        devSecret: process.env.JWT_SECRET ?? 'solo-para-desarrollo-cambiar',
        permitirDevToken: !esProduccion,
    }),
});
