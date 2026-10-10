// Pruebas de estructura y configuración: revisan el código y el arranque,
// sin necesidad de levantar la API.
import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { RAIZ, leer, ejecutarServidor, finalizar } from "./helpers.js";

const existe = (ruta) => access(path.join(RAIZ, ruta)).then(() => true, () => false);

test.after(() => finalizar());

test("H01 · el backend está separado en capas MVC (rutas, controladores, servicios, modelos)", async () => {
  for (const carpeta of ["routes", "controllers", "services", "models", "validators", "middlewares", "frontend"]) {
    assert.ok(await existe(carpeta), `falta la carpeta ${carpeta}/`);
  }
  // Solo los modelos (y la capa de BD) contienen SQL.
  for (const archivo of ["controllers/matriculaController.js", "services/cursoService.js", "routes/cursoRoutes.js"]) {
    const codigo = await leer(archivo);
    assert.doesNotMatch(codigo, /\b(SELECT|INSERT|UPDATE)\b/, `${archivo} no debería contener SQL`);
  }
});

test("H12 · la configuración sale del entorno y un valor inválido detiene el arranque", async () => {
  const { codigo, salida } = await ejecutarServidor({ PORT: "abc" });
  assert.notEqual(codigo, 0);
  assert.match(salida, /PORT inválido/);
});

test("H12 · sin DATABASE_URL el servidor no arranca y explica por qué", async () => {
  const { codigo, salida } = await ejecutarServidor({ DATABASE_URL: "" });
  assert.notEqual(codigo, 0);
  assert.match(salida, /DATABASE_URL/);
});

test("H07 · en producción no arranca si falta el proveedor de identidad (ADR-05)", async () => {
  const { codigo, salida } = await ejecutarServidor({ NODE_ENV: "production" });
  assert.notEqual(codigo, 0);
  assert.match(salida, /OIDC_ISSUER/);
});

test("H09 · los ID los genera PostgreSQL (IDENTITY) y Math.max ya no se usa", async () => {
  const schema = await leer("database/schema.sql");
  assert.equal((schema.match(/GENERATED ALWAYS AS IDENTITY/g) ?? []).length, 3);
  for (const carpeta of ["services", "models", "controllers"]) {
    for (const nombre of ["curso", "estudiante", "matricula"]) {
      const sufijo = { services: "Service", models: "Model", controllers: "Controller" }[carpeta];
      const codigo = await leer(`${carpeta}/${nombre}${sufijo}.js`);
      assert.doesNotMatch(codigo, /Math\.max/);
    }
  }
});

test("H13 · el frontend está dividido en api.js, ui.js y main.js; solo api.js usa fetch", async () => {
  const [api, ui, main] = await Promise.all(["api", "ui", "main"].map((n) => leer(`frontend/js/${n}.js`)));
  assert.match(api, /fetch\(/);
  assert.equal((api.match(/fetch\(/g) ?? []).length, 1, "debe existir un solo fetch, dentro de la función común");
  assert.match(api, /respuesta\.ok/, "api.js debe revisar response.ok");
  assert.doesNotMatch(ui, /fetch\(/);
  assert.doesNotMatch(main, /fetch\(/);
  const html = await leer("frontend/index.html");
  assert.match(html, /type="module"/);
});

test("H05 · el frontend no inserta HTML con innerHTML, outerHTML ni insertAdjacentHTML", async () => {
  for (const nombre of ["api", "ui", "main"]) {
    const codigo = await leer(`frontend/js/${nombre}.js`);
    assert.doesNotMatch(codigo, /\.(innerHTML|outerHTML)\s*[+]?=|insertAdjacentHTML|document\.write/, `${nombre}.js`);
  }
});

test("H15 · package.json fija Node 24, versiones exactas y los scripts del proyecto", async () => {
  const pkg = JSON.parse(await leer("package.json"));
  assert.equal(pkg.type, "module");
  assert.equal(pkg.engines.node, ">=24");
  for (const [nombre, version] of Object.entries(pkg.dependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+$/, `${nombre} debe tener versión exacta`);
  }
  for (const script of ["start", "dev", "test", "db:reset"]) assert.ok(pkg.scripts[script], `falta el script ${script}`);
  assert.equal((await leer(".nvmrc")).trim(), "24");
  assert.ok(await existe(pkg.main), `main apunta a ${pkg.main}, que debe existir`);
  assert.ok(await existe("tests"), "existe la carpeta de pruebas");
});
