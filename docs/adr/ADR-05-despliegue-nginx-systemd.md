# ADR-05 · Despliegue: Nginx 1.30 con TLS + servicio systemd

**Estado:** aceptada · **Hallazgos:** H07 (entorno de producción), H12

## Contexto
El original se ejecutaba con `node server.js` por HTTP, expuesto directamente y sin reinicio automático.

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Express directo en el puerto 443 | Sin piezas extra | Node tendría que manejar TLS y correr con privilegios para usar el puerto 443 |
| **Nginx 1.30 (TLS) + systemd** | TLS 1.2/1.3, HSTS, límite de peticiones; reinicio automático; Express solo en `127.0.0.1` | Un componente más que configurar |
| Docker + Kubernetes | Escalado y orquestación | Desproporcionado para un monolito en un servidor |
| PaaS (Render, Railway) | Sin administrar servidor | Datos institucionales fuera de la infraestructura de la universidad |

## Decisión
Nginx como proxy inverso con TLS (`deploy/nginx.conf`) y la aplicación como servicio systemd endurecido (`deploy/matricula.service`) con variables en `/etc/matricula/matricula.env`. Con `NODE_ENV=production` la aplicación **no arranca** si falta la configuración del proveedor de identidad, y `/auth/dev-token` no existe.

## Justificación
Separar el tráfico público (Nginx) del proceso de negocio (Express) es la forma estándar y sencilla de servir una aplicación Node con TLS, sin dejar de ser un monolito.

## Consecuencias
- ✅ Tráfico cifrado, HSTS y límite de 20 peticiones/s por IP en la API.
- ✅ systemd reinicia la aplicación si falla y guarda los registros (`journalctl`).
- ⚠️ Un solo servidor: no hay alta disponibilidad. Para escalar horizontalmente se añadirían más instancias detrás de Nginx (la aplicación no guarda estado en memoria, así que es posible).
- ⚠️ Hay que renovar los certificados (certbot lo automatiza).

**Evidencia:** `deploy/nginx.conf`, `deploy/matricula.service`, `deploy/matricula.env.example` · prueba `H07 · en producción no arranca si falta el proveedor de identidad (ADR-05)`.
