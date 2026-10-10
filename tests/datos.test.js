// Pruebas de datos: persistencia, concurrencia, volumen e integridad.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { iniciar, finalizar, pool, TEST_DATABASE_URL } from "./helpers.js";

let ctx;
let admin;

before(async () => {
  ctx = await iniciar();
  admin = await ctx.token({ rol: "administrativo", mfa: true });
});
after(() => finalizar(ctx));

test("H02 · los datos se guardan en PostgreSQL y no en memoria", async () => {
  const r = await ctx.api("POST", "/api/v1/estudiantes", {
    cuerpo: { nombre: "Persistente", carrera: "Software", semestre: 2 }, tokenUsado: admin,
  });
  assert.equal(r.status, 201);

  // Una conexión nueva e independiente de la aplicación encuentra el registro.
  const cliente = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await cliente.connect();
  try {
    const { rows } = await cliente.query("SELECT nombre FROM estudiantes WHERE id = $1", [r.body.id]);
    assert.equal(rows[0]?.nombre, "Persistente");
  } finally {
    await cliente.end();
  }
});

test("H04 · cinco matrículas simultáneas a un curso de 1 cupo: solo una entra", async () => {
  const curso = await ctx.api("POST", "/api/v1/cursos", {
    cuerpo: { nombre: "Último cupo", docente: "Ing. Y", cupos: 1 }, tokenUsado: admin,
  });
  const ids = [];
  for (let i = 0; i < 5; i++) {
    const e = await ctx.api("POST", "/api/v1/estudiantes", {
      cuerpo: { nombre: `Concurrente ${i}`, carrera: "Software", semestre: 1 }, tokenUsado: admin,
    });
    ids.push(e.body.id);
  }

  const respuestas = await Promise.all(ids.map((estudianteId) =>
    ctx.api("POST", "/api/v1/matriculas", { cuerpo: { estudianteId, cursoId: curso.body.id }, tokenUsado: admin })
  ));
  const codigos = respuestas.map((r) => r.status).sort();
  assert.deepEqual(codigos, [201, 409, 409, 409, 409]);

  const { rows } = await pool.query("SELECT cupos FROM cursos WHERE id = $1", [curso.body.id]);
  assert.equal(rows[0].cupos, 0, "los cupos nunca quedan negativos");
});

test("H09 · con más de 125 156 registros se sigue pudiendo crear y listar", async () => {
  // El sistema original usaba Math.max(...ids) y fallaba con RangeError a partir de 125 156 registros.
  await pool.query(`
    INSERT INTO estudiantes (nombre, carrera, semestre)
    SELECT 'Masivo ' || g, 'Software', 1 + g % 12 FROM generate_series(1, 130000) AS g`);

  const r = await ctx.api("POST", "/api/v1/estudiantes", {
    cuerpo: { nombre: "Después del volumen", carrera: "Software", semestre: 1 }, tokenUsado: admin,
  });
  assert.equal(r.status, 201);
  assert.ok(r.body.id > 130000);

  const lista = await ctx.api("GET", "/api/v1/estudiantes?limit=100000", { tokenUsado: admin });
  assert.equal(lista.status, 200);
  assert.equal(lista.body.length, 100, "el límite máximo por página es 100");
});

test("H10 · el reporte se calcula en SQL y una petición simple no espera a que termine", async () => {
  // Hay más de 130 000 estudiantes (prueba anterior). El reporte se calcula en
  // PostgreSQL, así que el proceso de Node queda libre para otras peticiones.
  const inicio = performance.now();
  const reporte = ctx.api("GET", "/api/v1/reporte?q=Masivo", { tokenUsado: admin });
  const simple = await ctx.api("GET", "/api/v1/cursos?limit=1", { tokenUsado: admin });
  const tiempoSimple = performance.now() - inicio;
  assert.equal(simple.status, 200);
  assert.equal((await reporte).status, 200);
  assert.ok(tiempoSimple < 500, `la petición simple tardó ${tiempoSimple.toFixed(0)} ms`);
});

test("H11 · la base rechaza una matrícula huérfana (clave foránea)", async () => {
  await assert.rejects(
    pool.query("INSERT INTO matriculas (estudiante_id, curso_id) VALUES (1, 999999)"),
    (error) => error.code === "23503"
  );
});

test("H11 · la base rechaza una matrícula duplicada aunque se salte la API (UNIQUE)", async () => {
  await assert.rejects(
    pool.query("INSERT INTO matriculas (estudiante_id, curso_id) VALUES (1, 1)"),
    (error) => error.code === "23505"
  );
});

test("H11 · la base rechaza cupos negativos (CHECK)", async () => {
  await assert.rejects(
    pool.query("UPDATE cursos SET cupos = -1 WHERE id = 1"),
    (error) => error.code === "23514"
  );
});
