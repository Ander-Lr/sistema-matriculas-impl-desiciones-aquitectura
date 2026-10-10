import pg from 'pg';
import { config } from '../config/config.js';

const { Pool } = pg;

// Un solo pool para toda la aplicación (ADR-03). La cadena de conexión
// viene de la configuración (H12), nunca escrita en el código.
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export default pool;
