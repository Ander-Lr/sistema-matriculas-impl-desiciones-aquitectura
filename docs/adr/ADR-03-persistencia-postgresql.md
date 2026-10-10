# ADR-03 · Persistencia: PostgreSQL 18 con el controlador `pg`

**Estado:** aceptada · **Hallazgos:** H02, H04, H09, H10, H11

## Contexto
Los datos vivían en arreglos en memoria: se perdían al reiniciar (H02), los IDs se calculaban con `Math.max(...arr)` que falla desde 125 156 registros (H09), la integridad referencial era manual (H11) y dos matrículas simultáneas podían superar los cupos (H04).

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Archivo JSON | Simple | Sin transacciones ni concurrencia; no resuelve H04 ni H11 |
| MongoDB | Flexible | Los datos son relacionales (estudiante–matrícula–curso); sin claves foráneas |
| MySQL / MariaDB | Relacional, conocido | Equivalente a PostgreSQL; no aporta ventaja para este caso |
| **PostgreSQL 18 + `pg` 8.23.1** | Transacciones, `FOR UPDATE`, FK, `UNIQUE`, `CHECK`, `IDENTITY` | Requiere instalar y administrar un servidor de base de datos |
| PostgreSQL + Sequelize (ORM) o Knex | Menos SQL escrito a mano | Sequelize impone su forma de trabajar; ambos usan `pg` por debajo. Usar tres librerías para lo mismo no tiene sentido |

## Decisión
PostgreSQL 18 con **solo** `pg` 8.23.1 y SQL parametrizado (`$1, $2`) dentro de `models/`. Esquema en `database/schema.sql` con `IDENTITY`, claves foráneas, `UNIQUE (estudiante_id, curso_id)` y `CHECK`. La matrícula se hace en una transacción con `SELECT … FOR UPDATE` sobre el curso.

## Justificación
Las reglas que antes dependían del código pasan a garantizarse en la base: aunque alguien se salte la API, no puede crear una matrícula huérfana, duplicada ni cupos negativos.

## Consecuencias
- ✅ Los datos sobreviven a reinicios.
- ✅ Cinco matrículas simultáneas al último cupo: entra una, las otras reciben 409.
- ✅ El SQL parametrizado evita inyección SQL.
- ✅ El reporte se calcula en PostgreSQL (`JOIN` + `array_agg`), no en un bucle de JavaScript: el proceso de Node queda libre para otras peticiones (H10).
- ⚠️ El `FOR UPDATE` serializa las matrículas de un mismo curso (aceptable: son milisegundos).
- ⚠️ Hay que respaldar la base (`pg_dump`) y gestionar los cambios de esquema.

**Evidencia:** `database/schema.sql`, `backend/db/pool.js`, `models/`, `services/matriculaService.js` · pruebas `H02`, `H04`, `H09`, `H11`.
