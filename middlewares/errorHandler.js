// Manejador central de errores (H07, H08). Traduce errores de negocio y de
// PostgreSQL a respuestas HTTP claras, y nunca expone detalles internos.
const ERRORES_PG = {
  '23505': [409, 'El registro ya existe.'],              // UNIQUE (p. ej. matrícula duplicada)
  '23503': [404, 'El registro relacionado no existe.'],  // FOREIGN KEY (H11)
  '23514': [422, 'Los datos no cumplen las reglas.'],     // CHECK
  '22P02': [422, 'Formato de dato inválido.'],
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (ERRORES_PG[err.code]) {
    const [status, error] = ERRORES_PG[err.code];
    return res.status(status).json({ error });
  }

  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON válido.' });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
  res.status(status).json({ error: err.message });
};
