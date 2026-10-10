// Crea (o recrea) las tablas a partir de database/schema.sql.
// Uso: npm run db:reset          → solo esquema
//      npm run db:reset -- --seed → esquema + datos de ejemplo
// El script del package.json ya pasa --seed.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './pool.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function reiniciarBase({ seed = true } = {}) {
  const schema = await readFile(path.join(raiz, 'database/schema.sql'), 'utf8');
  await pool.query(schema);
  if (seed) {
    const datos = await readFile(path.join(raiz, 'database/seed.sql'), 'utf8');
    await pool.query(datos);
  }
}

// Solo se ejecuta cuando se llama directamente (no cuando lo importan las pruebas).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await reiniciarBase({ seed: process.argv.includes('--seed') });
    console.log('Base de datos reiniciada.');
  } catch (error) {
    console.error('No se pudo reiniciar la base:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
