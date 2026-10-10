// Pruebas de la API REST: validación, códigos HTTP, seguridad y búsqueda.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { iniciar, finalizar } from "./helpers.js";

let ctx;
let admin;       // administrativo con MFA
let adminSinMfa; // administrativo sin MFA
let estudiante;  // estudiante con id 3

before(async () => {
  ctx = await iniciar();
  admin = await ctx.token({ rol: "administrativo", mfa: true });
  adminSinMfa = await ctx.token({ rol: "administrativo", mfa: false });
  estudiante = await ctx.token({ rol: "estudiante", mfa: true, sub: "3" });
});
after(() => finalizar(ctx));

// ---------- H03 · validación de entrada ----------
test("H03 · POST {} a estudiantes responde 422", async () => {
  const r = await ctx.api("POST", "/api/v1/estudiantes", { cuerpo: {}, tokenUsado: admin });
  assert.equal(r.status, 422);
});

test("H03 · semestre 99 responde 422", async () => {
  const r = await ctx.api("POST", "/api/v1/estudiantes", {
    cuerpo: { nombre: "Ana", carrera: "Software", semestre: 99 }, tokenUsado: admin,
  });
  assert.equal(r.status, 422);
});

test("H03 · cupos −5 responde 422", async () => {
  const r = await ctx.api("POST", "/api/v1/cursos", {
    cuerpo: { nombre: "Redes", docente: "Ing. X", cupos: -5 }, tokenUsado: admin,
  });
  assert.equal(r.status, 422);
});

test("H03 · un registro válido responde 201 con cabecera Location", async () => {
  const r = await ctx.api("POST", "/api/v1/cursos", {
    cuerpo: { nombre: "  Redes  ", docente: "Ing. X", cupos: "20" }, tokenUsado: admin,
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.nombre, "Redes", "los textos se guardan sin espacios sobrantes");
  assert.equal(r.body.cupos, 20);
  assert.equal(r.headers.get("location"), `/api/v1/cursos/${r.body.id}`);
});

// ---------- H05 · XSS ----------
test("H05 · un nombre con HTML se guarda como texto literal y la respuesta lleva CSP", async () => {
  const malicioso = "<img src=x onerror=alert(1)>";
  const r = await ctx.api("POST", "/api/v1/estudiantes", {
    cuerpo: { nombre: malicioso, carrera: "Software", semestre: 3 }, tokenUsado: admin,
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.nombre, malicioso);

  const pagina = await fetch(`${ctx.url}/`);
  const csp = pagina.headers.get("content-security-policy");
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /script-src-attr 'none'/, "bloquea manejadores en línea como onerror=");
});

// ---------- H06 · identidad y rol ----------
test("H06 · sin token la API responde 401", async () => {
  const r = await ctx.api("GET", "/api/v1/cursos");
  assert.equal(r.status, 401);
});

test("H06 · un token falsificado responde 401", async () => {
  const r = await ctx.api("GET", "/api/v1/cursos", { tokenUsado: "eyJhbGciOiJIUzI1NiJ9.e30.firma-falsa" });
  assert.equal(r.status, 401);
});

test("H06 · un estudiante que intenta crear un curso recibe 403", async () => {
  const r = await ctx.api("POST", "/api/v1/cursos", {
    cuerpo: { nombre: "Hack", docente: "X", cupos: 5 }, tokenUsado: estudiante,
  });
  assert.equal(r.status, 403);
});

test("H06 · un administrativo sin MFA no puede modificar datos (401)", async () => {
  const r = await ctx.api("POST", "/api/v1/cursos", {
    cuerpo: { nombre: "Redes", docente: "X", cupos: 5 }, tokenUsado: adminSinMfa,
  });
  assert.equal(r.status, 401);
  assert.match(r.body.error, /MFA/);
});

test("H06 · un administrativo sin MFA sí puede consultar", async () => {
  const r = await ctx.api("GET", "/api/v1/cursos", { tokenUsado: adminSinMfa });
  assert.equal(r.status, 200);
});

test("H06 · un estudiante no puede matricular a otro estudiante (403)", async () => {
  const r = await ctx.api("POST", "/api/v1/matriculas", {
    cuerpo: { estudianteId: 1, cursoId: 3 }, tokenUsado: estudiante,
  });
  assert.equal(r.status, 403);
});

test("H06 · un estudiante no puede ver el reporte académico (403)", async () => {
  const r = await ctx.api("GET", "/api/v1/reporte", { tokenUsado: estudiante });
  assert.equal(r.status, 403);
});

// ---------- H08 · códigos HTTP correctos ----------
test("H08 · matricular a un estudiante inexistente responde 404", async () => {
  const r = await ctx.api("POST", "/api/v1/matriculas", {
    cuerpo: { estudianteId: 9999, cursoId: 1 }, tokenUsado: admin,
  });
  assert.equal(r.status, 404);
});

test("H08 · matricular en un curso inexistente responde 404", async () => {
  const r = await ctx.api("POST", "/api/v1/matriculas", {
    cuerpo: { estudianteId: 1, cursoId: 9999 }, tokenUsado: admin,
  });
  assert.equal(r.status, 404);
});

test("H08 · una matrícula duplicada responde 409", async () => {
  // El seed ya matricula al estudiante 1 en el curso 1.
  const r = await ctx.api("POST", "/api/v1/matriculas", {
    cuerpo: { estudianteId: 1, cursoId: 1 }, tokenUsado: admin,
  });
  assert.equal(r.status, 409);
});

test("H08 · crear devuelve el registro con su id y la cabecera Location", async () => {
  const r = await ctx.api("POST", "/api/v1/estudiantes", {
    cuerpo: { nombre: "Con id", carrera: "Software", semestre: 1 }, tokenUsado: admin,
  });
  assert.equal(r.status, 201);
  assert.ok(Number.isInteger(r.body.id));
  assert.equal(r.headers.get("location"), `/api/v1/estudiantes/${r.body.id}`);
});

test("H08 · la API está versionada: /api/v1 existe y la ruta antigua sin versión no", async () => {
  const nueva = await ctx.api("GET", "/api/v1/estudiantes", { tokenUsado: admin });
  const antigua = await ctx.api("GET", "/api/estudiantes", { tokenUsado: admin });
  assert.equal(nueva.status, 200);
  assert.equal(antigua.status, 404);
});

// ---------- H07 · manejo de errores y entorno ----------
test("H07 · un JSON mal formado responde 400 en JSON, sin traza ni rutas internas", async () => {
  const r = await fetch(`${ctx.url}/api/v1/estudiantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${admin}` },
    body: "{mal json",
  });
  assert.equal(r.status, 400);
  assert.match(r.headers.get("content-type"), /application\/json/);
  const texto = await r.text();
  assert.doesNotMatch(texto, /node_modules|at .*\(|SyntaxError/);
});

test("H07 · las respuestas no revelan la tecnología (sin X-Powered-By)", async () => {
  const r = await fetch(`${ctx.url}/`);
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("H07 · una ruta de API inexistente responde 404 en JSON", async () => {
  const r = await ctx.api("GET", "/api/v1/no-existe", { tokenUsado: admin });
  assert.equal(r.status, 404);
  assert.ok(r.body.error);
});

// ---------- H14 · API versionada, búsqueda y paginación ----------
test("H14 · ?q= filtra por nombre", async () => {
  const r = await ctx.api("GET", "/api/v1/estudiantes?q=gómez", { tokenUsado: admin });
  assert.equal(r.status, 200);
  assert.ok(r.body.length >= 1);
  assert.ok(r.body.every((e) => e.nombre.toLowerCase().includes("gómez")));
});

test("H14 · limit y offset paginan los resultados", async () => {
  const pagina1 = await ctx.api("GET", "/api/v1/cursos?limit=1&offset=0", { tokenUsado: admin });
  const pagina2 = await ctx.api("GET", "/api/v1/cursos?limit=1&offset=1", { tokenUsado: admin });
  assert.equal(pagina1.body.length, 1);
  assert.equal(pagina2.body.length, 1);
  assert.notEqual(pagina1.body[0].id, pagina2.body[0].id);
});
