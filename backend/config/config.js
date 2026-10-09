const entorno = process.env.NODE_ENV ?? 'development';
const puerto = Number(process.env.PORT ?? 3000);

// Si un valor es inválido, el servidor no arranca y explica por qué.
if (!Number.isInteger(puerto) || puerto < 0 || puerto > 65535) {
    throw new Error(`PORT inválido: "${process.env.PORT}"`);
}

export const config = Object.freeze({
    entorno,
    esProduccion: entorno === 'production',
    puerto,
    host: process.env.HOST ?? '127.0.0.1',
    databaseUrl: process.env.DATABASE_URL, // se valida en el Paso 3, cuando exista la base
});