# ADR-04 · Comunicación: API REST versionada (`/api/v1`) con JSON

**Estado:** aceptada · **Hallazgos:** H03, H07, H08, H14

## Contexto
La API original aceptaba cualquier dato con 201 (`POST {}` → 201, semestre 99 → 201, cupos −5 → 201), devolvía 400 para todo error de negocio, no estaba versionada y siempre devolvía la lista completa.

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| **REST + JSON versionado** | Estándar, fácil de probar con Postman, el frontend actual ya usa `fetch` | Varias llamadas para pantallas compuestas |
| GraphQL | El cliente pide exactamente lo que necesita | Servidor y cliente nuevos; complejidad innecesaria para 4 recursos |
| gRPC | Muy eficiente | No funciona directamente desde el navegador |
| Renderizado en servidor (plantillas) | Sin API | Cambia la arquitectura del frontend; no es una refactorización |

## Decisión
Rutas bajo `/api/v1/...`; validadores en `validators/`; manejador central de errores; códigos 201 + `Location`, 400, 401, 403, 404, 409 y 422; búsqueda con `?q=` y paginación con `limit` (máx. 100) y `offset`.

## Justificación
La versión permite cambiar la API sin romper clientes; los códigos correctos le dicen al cliente qué pasó sin leer el texto; la paginación evita respuestas gigantes.

## Consecuencias
- ✅ `POST {}` → 422; inexistente → 404; duplicado → 409.
- ✅ Errores internos devuelven un mensaje genérico (no se filtran detalles).
- ⚠️ La respuesta de listado es un arreglo sin el total de registros; si se necesita, habrá que añadirlo en `/api/v2` o como cabecera.

**Evidencia:** `routes/index.js`, `validators/`, `middlewares/errorHandler.js`, `errors/AppError.js` · pruebas `H03`, `H07`, `H08`, `H14`.
