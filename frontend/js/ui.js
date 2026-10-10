// ui.js — todo lo que pinta en pantalla (Vista).
// Regla de seguridad (H05): los datos que vienen del servidor se insertan
// SIEMPRE con textContent. En este archivo no existe innerHTML, así que un
// nombre como <img src=x onerror=alert(1)> se muestra como texto y no se ejecuta.

// Crea un elemento con atributos y contenido de texto seguro.
export function el(etiqueta, { texto, clase, atributos = {} } = {}, hijos = []) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined && texto !== null) nodo.textContent = String(texto);
  for (const [nombre, valor] of Object.entries(atributos)) nodo.setAttribute(nombre, valor);
  for (const hijo of hijos) nodo.append(hijo);
  return nodo;
}

// Rellena un <tbody> con una fila por registro. "columnas" son las claves a mostrar.
export function pintarTabla(tbody, registros, columnas, textoVacio = "Sin registros.") {
  if (!registros.length) {
    const celda = el("td", { texto: textoVacio, clase: "text-body-secondary", atributos: { colspan: String(columnas.length) } });
    tbody.replaceChildren(el("tr", {}, [celda]));
    return;
  }
  const filas = registros.map((registro) =>
    el("tr", {}, columnas.map((columna) => el("td", { texto: registro[columna] })))
  );
  tbody.replaceChildren(...filas);
}

export function llenarSelect(select, registros, { valor = "id", etiqueta = "nombre", vacio = "Seleccione…" } = {}) {
  const anterior = select.value;
  const opciones = registros.map((r) => el("option", { texto: `${r[valor]} · ${r[etiqueta]}`, atributos: { value: String(r[valor]) } }));
  select.replaceChildren(el("option", { texto: vacio, atributos: { value: "" } }), ...opciones);
  if (registros.some((r) => String(r[valor]) === anterior)) select.value = anterior;
}

// Muestra un mensaje tipo alerta de Bootstrap: "success", "danger", "warning", "info".
export function mostrarMensaje(contenedor, texto, tipo = "info") {
  if (!texto) {
    contenedor.replaceChildren();
    return;
  }
  contenedor.replaceChildren(el("div", { texto, clase: `alert alert-${tipo} py-2 mb-0`, atributos: { role: "alert" } }));
}

export function pintarReporte(contenedor, filas) {
  if (!filas.length) {
    contenedor.replaceChildren(el("p", { texto: "No hay estudiantes para mostrar.", clase: "text-body-secondary" }));
    return;
  }
  const items = filas.map((fila) =>
    el("div", { clase: "list-group-item" }, [
      el("strong", { texto: fila.estudiante }),
      el("span", { texto: ` — ${fila.carrera}`, clase: "text-body-secondary" }),
      el("div", { texto: `Cursos: ${fila.cursos.length ? fila.cursos.join(", ") : "Ninguno"}`, clase: "small" }),
    ])
  );
  contenedor.replaceChildren(...items);
}

const NOMBRE_ROL = { administrativo: "Personal administrativo", estudiante: "Estudiante" };

// Ajusta la interfaz según la sesión: muestra quién está conectado y oculta
// los controles que su rol no puede usar. Es solo comodidad visual: el
// servidor vuelve a comprobar los permisos en cada petición (ADR-06).
export function pintarSesion(datos) {
  const conectado = Boolean(datos);
  document.querySelector("#formSesion").hidden = conectado;
  document.querySelector("#sesionActiva").hidden = !conectado;
  document.querySelector("#avisoSesion").hidden = conectado;
  document.querySelector("main").classList.toggle("sin-sesion", !conectado);

  document.querySelector("#sesionTexto").textContent = conectado
    ? `${NOMBRE_ROL[datos.rol] ?? datos.rol} · ID ${datos.sub}${datos.mfa ? " · MFA ✓" : " · sin MFA"}`
    : "";

  for (const elemento of document.querySelectorAll("[data-rol]")) {
    elemento.hidden = conectado && datos.rol !== elemento.dataset.rol;
  }
}

export function limpiarTodo() {
  for (const id of ["#tablaEstudiantes", "#tablaCursos", "#tablaMatriculas", "#reporte", "#estudianteSelect", "#cursoSelect"]) {
    document.querySelector(id).replaceChildren();
  }
  for (const id of ["#msgEstudiante", "#msgCurso", "#mensaje", "#msgReporte"]) {
    document.querySelector(id).replaceChildren();
  }
  for (const buscador of document.querySelectorAll('input[type="search"]')) buscador.value = "";
}
