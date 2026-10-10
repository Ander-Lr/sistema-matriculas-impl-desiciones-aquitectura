# Sistema de Matrícula Universitaria — versión refactorizada

Aplicación de la asignatura **Arquitectura de Software**. Parte del sistema didáctico original (todo en `server.js` y `public/app.js`, datos en memoria) y aplica las decisiones de arquitectura documentadas en [`docs/adr/`](docs/adr).

**Arquitectura:** monolito Express con roles MVC · PostgreSQL 18 · API REST `/api/v1` · OAuth 2.0 + OpenID Connect con MFA escalonada y roles · frontend con módulos ES y Bootstrap 5.3.8 · Nginx + systemd.

## Estructura

```
backend/        app.js (arma Express), server.js (abre el puerto), config/, db/
routes/         CONTROLADOR: URL + verbo + roles permitidos
controllers/    CONTROLADOR: recibe la petición y responde HTTP
services/       reglas de negocio (cupos, duplicados, transacción)
models/         MODELO: el único lugar con SQL
validators/     reglas de entrada y paginación
middlewares/    autenticación, roles, MFA, manejador de errores
errors/         errores de negocio → códigos HTTP
frontend/       VISTA: index.html, css/, js/api.js, js/ui.js, js/main.js
database/       schema.sql, seed.sql
deploy/         nginx.conf, matricula.service, matricula.env.example
docs/           ADRs y tabla de trazabilidad
tests/          una o más pruebas por hallazgo (H01–H15)
```

## Ejecutar en desarrollo

Requisitos: Node.js 24 y PostgreSQL 18.

```bash
# 1. Base de datos (una sola vez, en psql como superusuario)
CREATE USER matricula PASSWORD 'cambiar_clave';
CREATE DATABASE matricula OWNER matricula;
CREATE DATABASE matricula_test OWNER matricula;   -- la usan las pruebas

# 2. Proyecto
npm ci
cp .env.example .env        # en Windows: copy .env.example .env
npm run db:reset            # crea las tablas y carga los datos de ejemplo
npm start                   # http://127.0.0.1:3000
```

En la pantalla, use el panel de sesión de la barra superior: elija **Personal administrativo** o **Estudiante**, el ID y si la sesión tiene **MFA**. Ese panel llama a `/auth/dev-token`, que simula al proveedor de identidad y **solo existe fuera de producción**.

## Pruebas

```bash
npm test
```

Las pruebas usan `TEST_DATABASE_URL` o, si no está definida, la base de `DATABASE_URL` con el sufijo `_test` (por ejemplo `matricula_test`). **Borran y recrean las tablas** de esa base, por eso se niegan a correr si el nombre no termina en `_test`.

## API

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método y ruta | Roles | MFA | Respuestas |
| --- | --- | --- | --- |
| `GET /api/v1/estudiantes?q=&limit=&offset=` | administrativo, estudiante | no | 200 |
| `POST /api/v1/estudiantes` | administrativo | sí | 201, 422 |
| `GET /api/v1/cursos?q=&limit=&offset=` | administrativo, estudiante | no | 200 |
| `POST /api/v1/cursos` | administrativo | sí | 201, 422 |
| `GET /api/v1/matriculas?q=&limit=&offset=` | administrativo, estudiante | no | 200 |
| `POST /api/v1/matriculas` | administrativo; estudiante solo para sí mismo | sí | 201, 403, 404, 409, 422 |
| `GET /api/v1/reporte?q=&limit=&offset=` | administrativo | no | 200 |

Sin token o token inválido → 401 · rol insuficiente → 403 · falta MFA → 401. `limit` máximo: 100.

## Despliegue

Ver los comentarios de [`deploy/matricula.service`](deploy/matricula.service) y [`deploy/nginx.conf`](deploy/nginx.conf). Con `NODE_ENV=production` la aplicación no arranca si faltan `OIDC_ISSUER`, `OIDC_AUDIENCE` u `OIDC_JWKS_URI`.

## Autores

- Lara Chicaiza Anderson Lenin
- Calapucha Ñacata Carlos Vicente

Universidad de las Fuerzas Armadas ESPE, sede Santo Domingo · Arquitectura del Software · NRC 32828 · Docente: Ing. Kevin Chuquitarco.
