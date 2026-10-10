# ADR-02 · Plataforma: Node.js 24 + Express 5 con módulos ES

**Estado:** aceptada · **Hallazgos:** H12, H15

## Contexto
El original usaba CommonJS, versiones con `^` (no reproducibles), sin `engines`, sin scripts de prueba, y el puerto escrito en el código.

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| **Node.js 24 LTS + Express 5.2.1** | Es lo que ya usa el sistema: se refactoriza en vez de reescribir; Express 5 maneja errores de funciones `async` | Express no impone estructura (por eso ADR-01) |
| NestJS | Estructura e inyección de dependencias incluidas | Framework con estructura impuesta: obligaría a reescribir todo el sistema |
| Fastify | Más rápido, validación por esquemas | Cambiar de framework no resuelve ningún hallazgo y añade curva de aprendizaje |
| Otro lenguaje (Java/Spring, Python/Django) | Ecosistemas maduros | Reescritura total; el equipo y el código existente son JavaScript |

## Decisión
Node.js 24 (`.nvmrc`, `engines`), Express 5.2.1, `"type": "module"`, versiones exactas y scripts `start`, `dev`, `test` y `db:reset`. Configuración por variables de entorno en `backend/config/config.js`.

## Justificación
No se usaron frameworks con estructura impuesta (React, Angular, NestJS) porque obligarían a reescribir el sistema en lugar de refactorizarlo. Las versiones exactas hacen que todos los integrantes y el servidor ejecuten lo mismo.

## Consecuencias
- ✅ `npm ci` instala exactamente las mismas versiones en cualquier equipo.
- ✅ Si la configuración es inválida (puerto, base de datos), el servidor no arranca y explica por qué.
- ⚠️ Las versiones exactas no reciben parches automáticos: hay que actualizarlas a propósito (`npm outdated`).

**Evidencia:** `package.json`, `.nvmrc`, `.env.example`, `backend/config/config.js` · pruebas `H12 ·` y `H15 ·`.
