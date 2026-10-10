// main.js — eventos: conecta los formularios y botones con api.js y ui.js.
import { sesion, estudiantes, cursos, matriculas, reporte } from "./api.js";
import { pintarTabla, llenarSelect, mostrarMensaje, pintarReporte, pintarSesion, limpiarTodo } from "./ui.js";

const $ = (selector) => document.querySelector(selector);

// Texto de los buscadores (?q=)
const filtros = { estudiantes: "", cursos: "", matriculas: "" };

// Muestra el error en el contenedor indicado y, si la sesión expiró, vuelve al inicio.
function manejarError(contenedor, error) {
  mostrarMensaje(contenedor, error.message, error.status >= 500 || error.status === 0 ? "danger" : "warning");
  if (error.status === 401 && !sesion.actual()) {
    pintarSesion(null);
    limpiarTodo();
  }
}

// ---------- Carga de datos ----------
async function cargarEstudiantes() {
  try {
    const lista = await estudiantes.listar({ q: filtros.estudiantes });
    pintarTabla($("#tablaEstudiantes"), lista, ["id", "nombre", "carrera", "semestre"]);
  } catch (error) {
    manejarError($("#msgEstudiante"), error);
  }
}

async function cargarCursos() {
  try {
    const lista = await cursos.listar({ q: filtros.cursos });
    pintarTabla($("#tablaCursos"), lista, ["id", "nombre", "docente", "cupos"]);
  } catch (error) {
    manejarError($("#msgCurso"), error);
  }
}

async function cargarMatriculas() {
  try {
    const lista = await matriculas.listar({ q: filtros.matriculas });
    pintarTabla($("#tablaMatriculas"), lista, ["id", "estudiante", "curso"]);
  } catch (error) {
    manejarError($("#mensaje"), error);
  }
}

// Los <select> de matrícula usan listas completas (sin filtro de búsqueda).
async function cargarSelects() {
  try {
    const [listaEstudiantes, listaCursos] = await Promise.all([estudiantes.listar(), cursos.listar()]);
    const usuario = sesion.actual();
    // Un estudiante solo puede matricularse a sí mismo: se le muestra solo su registro.
    const visibles = usuario?.rol === "estudiante"
      ? listaEstudiantes.filter((e) => String(e.id) === String(usuario.sub))
      : listaEstudiantes;
    llenarSelect($("#estudianteSelect"), visibles, { vacio: "Estudiante…" });
    llenarSelect($("#cursoSelect"), listaCursos.map((c) => ({ ...c, nombre: `${c.nombre} (${c.cupos} cupos)` })), { vacio: "Curso…" });
  } catch (error) {
    manejarError($("#mensaje"), error);
  }
}

function cargarTodo() {
  return Promise.all([cargarEstudiantes(), cargarCursos(), cargarMatriculas(), cargarSelects()]);
}

// ---------- Formularios ----------
// Envía un formulario, muestra el resultado y recarga lo necesario.
function alEnviar(formulario, contenedor, accion, mensajeExito, recargar) {
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = formulario.querySelector("button");
    boton.disabled = true;
    try {
      const resultado = await accion();
      mostrarMensaje(contenedor, typeof mensajeExito === "function" ? mensajeExito(resultado) : mensajeExito, "success");
      formulario.reset();
      await recargar();
    } catch (error) {
      manejarError(contenedor, error);
    } finally {
      boton.disabled = false;
    }
  });
}

alEnviar(
  $("#formEstudiante"),
  $("#msgEstudiante"),
  () => estudiantes.crear({
    nombre: $("#nombre").value,
    carrera: $("#carrera").value,
    semestre: Number($("#semestre").value),
  }),
  (e) => `Estudiante registrado con ID ${e.id}.`,
  () => Promise.all([cargarEstudiantes(), cargarSelects()])
);

alEnviar(
  $("#formCurso"),
  $("#msgCurso"),
  () => cursos.crear({
    nombre: $("#curso").value,
    docente: $("#docente").value,
    cupos: Number($("#cupos").value),
  }),
  (c) => `Curso registrado con ID ${c.id}.`,
  () => Promise.all([cargarCursos(), cargarSelects()])
);

alEnviar(
  $("#formMatricula"),
  $("#mensaje"),
  () => matriculas.crear({
    estudianteId: Number($("#estudianteSelect").value),
    cursoId: Number($("#cursoSelect").value),
  }),
  (r) => r.mensaje,
  () => Promise.all([cargarMatriculas(), cargarCursos(), cargarSelects()])
);

// ---------- Reporte ----------
$("#btnReporte").addEventListener("click", async () => {
  mostrarMensaje($("#msgReporte"), "");
  try {
    pintarReporte($("#reporte"), await reporte.obtener());
  } catch (error) {
    manejarError($("#msgReporte"), error);
  }
});

// ---------- Buscadores ----------
// Esperan 300 ms después de la última tecla para no enviar una petición por letra.
function buscador(input, clave, cargar) {
  let espera;
  input.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      filtros[clave] = input.value.trim();
      cargar();
    }, 300);
  });
}

buscador($("#buscarEstudiante"), "estudiantes", cargarEstudiantes);
buscador($("#buscarCurso"), "cursos", cargarCursos);
buscador($("#buscarMatricula"), "matriculas", cargarMatriculas);

// ---------- Sesión ----------
$("#formSesion").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const datos = await sesion.iniciarDesarrollo({
      rol: $("#sesionRol").value,
      sub: $("#sesionSub").value || "1",
      mfa: $("#sesionMfa").checked,
    });
    pintarSesion(datos);
    await cargarTodo();
  } catch (error) {
    $("#avisoSesion").textContent = `No se pudo iniciar sesión: ${error.message}`;
  }
});

$("#btnCerrarSesion").addEventListener("click", () => {
  sesion.cerrar();
  pintarSesion(null);
  limpiarTodo();
  Object.keys(filtros).forEach((clave) => { filtros[clave] = ""; });
  $("#avisoSesion").textContent = "Inicie sesión para consultar y registrar información.";
});

// ---------- Inicio ----------
const usuarioInicial = sesion.actual();
pintarSesion(usuarioInicial);
if (usuarioInicial) cargarTodo();
