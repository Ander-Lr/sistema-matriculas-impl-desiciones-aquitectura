# ADR-07 · Frontend: HTML5, CSS3 y JavaScript con módulos ES + Bootstrap 5.3.8 local

**Estado:** aceptada · **Hallazgos:** H05, H13, H14

## Contexto
`app.js` mezclaba HTTP, DOM y eventos; el `fetch` POST estaba repetido 3 veces; `getJSON` no revisaba `response.ok`; las tablas se pintaban con `innerHTML` y plantillas de texto (origen del XSS de H05).

## Alternativas consideradas
| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| **JavaScript con módulos ES** (`api.js`, `ui.js`, `main.js`) | Sin compilación; se refactoriza el código existente; responsabilidades separadas | Sin reactividad automática: hay que repintar a mano |
| React / Angular / Vue | Componentes, ecosistema | Framework con estructura impuesta y paso de compilación: sería reescribir el frontend |
| Mantener un solo `app.js` corrigiendo `innerHTML` | Menor cambio | Resuelve H05 pero no H13 |
| Bootstrap desde CDN | Sin instalar nada | Depende de Internet y choca con la CSP de `helmet` |

## Decisión
- `api.js`: única puerta hacia la API (un solo `fetch`, token, `response.ok`, errores).
- `ui.js`: pinta el DOM solo con `createElement` y `textContent`.
- `main.js`: eventos de formularios, buscadores (`?q=` con espera de 300 ms) y panel de sesión.
- Bootstrap 5.3.8 instalado con npm y servido por Express en `/vendor/bootstrap`.

## Justificación
Cada archivo tiene una sola razón para cambiar, y la regla de seguridad (nunca insertar HTML con datos del servidor) queda concentrada en `ui.js`.

## Consecuencias
- ✅ El nombre `<img src=x onerror=…>` aparece como texto.
- ✅ Un cambio en la API (URL, cabeceras) se hace en un solo archivo.
- ✅ La interfaz oculta lo que el rol no puede usar (el servidor vuelve a comprobarlo siempre).
- ⚠️ Si la interfaz crece mucho, repintar a mano será costoso y podría justificar un framework.

**Evidencia:** `frontend/index.html`, `frontend/js/api.js`, `ui.js`, `main.js` · pruebas `H05 · el frontend no inserta HTML…` y `H13 ·`.
