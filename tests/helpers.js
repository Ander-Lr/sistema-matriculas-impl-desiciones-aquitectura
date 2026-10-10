// Utilidades compartidas por las pruebas.
// IMPORTANTE: las pruebas BORRAN y recrean las tablas. Por eso nunca usan la
// base de desarrollo: usan TEST_DATABASE_URL o, si no existe, la misma URL de
// DATABASE_URL con el sufijo "_test" en el nombre de la base.
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function urlDePruebas() {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  if (!process.env.DATABASE_URL) {
    throw new Error("Defina TEST_DATABASE_URL o DATABASE_URL en .env para ejecutar las pruebas.");
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `${url.pathname.replace(/_test$/, "")}_test`;
  return url.toString();
}

export const TEST_DATABASE_URL = urlDePruebas();
if (!new URL(TEST_DATABASE_URL).pathname.endsWith("_test")) {
  throw new Error("Por seguridad, el nombre de la base de pruebas debe terminar en _test.");
}

// La configuración se lee al importar: hay que fijar el entorno ANTES de
// cargar la aplicación, por eso se usa import() dinámico.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = TEST_DATABASE_URL;
delete process.env.POSTGRES_DB;

const { default: app } = await import("../backend/app.js");
const { default: pool } = await import("../backend/db/pool.js");
const { reiniciarBase } = await import("../backend/db/init.js");

export { pool };

// Levanta la aplicación en un puerto libre con la base recién reiniciada.
export async function iniciar() {
  await reiniciarBase({ seed: true });
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const url = `http://127.0.0.1:${servidor.address().port}`;

  const token = async ({ rol = "administrativo", mfa = true, sub = "1" } = {}) => {
    const r = await fetch(`${url}/auth/dev-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol, mfa, sub }),
    });
    return (await r.json()).token;
  };

  // Petición a la API: devuelve { status, body, headers }.
  const api = async (metodo, ruta, { cuerpo, tokenUsado } = {}) => {
    const headers = {};
    if (tokenUsado) headers.Authorization = `Bearer ${tokenUsado}`;
    if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
    const r = await fetch(`${url}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    const texto = await r.text();
    let body;
    try { body = JSON.parse(texto); } catch { body = texto; }
    return { status: r.status, body, headers: r.headers };
  };

  const cerrar = () => new Promise((resolve) => servidor.close(resolve));
  return { url, token, api, cerrar };
}

export async function finalizar(contexto) {
  await contexto?.cerrar();
  await pool.end();
}

export const leer = (relativo) => readFile(path.join(RAIZ, relativo), "utf8");

// Ejecuta el servidor como proceso aparte con un entorno dado y devuelve
// { codigo, salida } (para probar la configuración, H12 y ADR-05).
export function ejecutarServidor(entorno, esperaMs = 1500) {
  return new Promise((resolve) => {
    const env = { PATH: process.env.PATH, DATABASE_URL: TEST_DATABASE_URL, PORT: "0", ...entorno };
    const hijo = spawn(process.execPath, ["backend/server.js"], { cwd: RAIZ, env });
    let salida = "";
    hijo.stdout.on("data", (d) => { salida += d; });
    hijo.stderr.on("data", (d) => { salida += d; });
    const temporizador = setTimeout(() => hijo.kill(), esperaMs);
    hijo.on("exit", (codigo) => {
      clearTimeout(temporizador);
      resolve({ codigo, salida });
    });
  });
}
