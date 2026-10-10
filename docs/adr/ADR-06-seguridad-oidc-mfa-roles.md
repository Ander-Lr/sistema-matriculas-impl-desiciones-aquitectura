# ADR-06 · Seguridad: OAuth 2.0 + OpenID Connect con MFA escalonada y control de acceso por roles

**Estado:** aceptada · **Hallazgos:** H05, H06

## Contexto
El original no tenía autenticación (cualquiera podía crear cursos o matricular), no distinguía entre estudiantes y personal administrativo, y era vulnerable a XSS: un nombre `<img src=x onerror=…>` se guardaba con 201 y se ejecutaba al abrir la página.

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Usuario y contraseña propios + sesiones | Control total | Guardar contraseñas de la institución en la aplicación; duplicar cuentas que ya existen |
| JWT propio firmado por la aplicación | Simple | La aplicación se vuelve proveedor de identidad; sin MFA ni cierre de sesión central |
| **OAuth 2.0 + OIDC con el proveedor institucional, MFA escalonada y roles** | Inicio de sesión único, MFA gestionada por el proveedor, la aplicación nunca ve contraseñas | Depende de la disponibilidad del proveedor de identidad |
| SAML | Estándar institucional antiguo | Más complejo de integrar en una API JSON |

## Decisión
- El token (JWT) lo emite el proveedor OIDC y la API lo verifica con `jose` contra sus claves públicas (JWKS), comprobando emisor y audiencia.
- `permitir(...roles)` en cada ruta: el **personal administrativo** crea estudiantes y cursos y ve el reporte; el **estudiante** consulta y solo puede matricularse a sí mismo.
- **MFA escalonada (step-up):** consultar no exige MFA; toda operación que modifica datos sí (`exigirMfa`, claim `amr`).
- `helmet()` añade cabeceras de seguridad y una CSP que bloquea scripts en línea; el frontend solo usa `textContent` (ver ADR-07).
- En desarrollo, `/auth/dev-token` simula al proveedor; la configuración lo prohíbe en producción.

## Justificación
La autenticación se delega a quien ya la gestiona (la institución), y la aplicación se limita a autorizar según el rol. La MFA se pide solo donde el riesgo lo justifica.

## Consecuencias
- ✅ Sin token → 401; estudiante que crea un curso → 403; administrativo sin MFA → 401.
- ✅ El nombre malicioso de H05 se muestra como texto y no se ejecuta.
- ⚠️ Si el proveedor de identidad cae, nadie puede iniciar sesión.
- ⚠️ El token vive 2 h en `sessionStorage`; una revocación inmediata requeriría tokens más cortos o introspección.

**Evidencia:** `middlewares/auth.js`, `routes/*Routes.js`, `routes/authRoutes.js`, `backend/app.js` · pruebas `H05` y `H06`.
