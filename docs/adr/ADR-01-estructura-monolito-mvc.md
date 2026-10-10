# ADR-01 · Estructura: monolito con roles MVC

**Estado:** aceptada · **Hallazgos:** H01, H13

## Contexto
Todo el backend original estaba en un solo `server.js` (datos, rutas, reglas y respuestas HTTP mezclados) y todo el frontend en un solo `app.js`. Cualquier cambio obligaba a tocar el archivo completo y no había forma de probar una parte por separado.

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Mantener un solo archivo | Cero esfuerzo | No resuelve H01 ni H13; la mantenibilidad sigue igual |
| **Monolito con roles MVC** (rutas → controladores → servicios → modelos) | Un solo proceso y un solo despliegue; cada cambio toca una capa acotada; se puede refactorizar sin reescribir | Más archivos; exige disciplina para no saltarse capas |
| Microservicios (estudiantes, cursos, matrículas) | Escalado y despliegue independientes | La matrícula necesita una transacción entre estudiante, curso y cupos; se volvería distribuida. Demasiada complejidad operativa para el tamaño del sistema |
| Arquitectura hexagonal / limpia | Aísla totalmente el dominio | Sobredimensionada para cuatro entidades; más abstracciones que reglas de negocio |

## Decisión
Monolito modular con roles MVC: `routes/` y `controllers/` (Controlador), `services/` (reglas de negocio), `models/` (Modelo, único lugar con SQL) y `frontend/` (Vista). Express sirve frontend y API desde un solo proceso.

## Justificación
Separar responsabilidades para que cada cambio toque una parte acotada (mantenibilidad), sin pagar el costo de un sistema distribuido. La regla de cupos se mantiene dentro de una sola transacción local.

## Consecuencias
- ✅ Cada capa se puede leer y probar por separado; los controladores no contienen SQL (verificado en `tests/estructura.test.js`).
- ✅ Un solo artefacto para desplegar y monitorear.
- ⚠️ Toda la aplicación escala junta: si un módulo necesitara escalar solo, habría que extraerlo más adelante.
- ⚠️ La separación depende de la disciplina del equipo; no hay nada que impida importar un modelo desde una ruta.

**Evidencia:** `routes/`, `controllers/`, `services/`, `models/`, `frontend/js/` · prueba `H01 · el backend está separado en capas MVC`.
