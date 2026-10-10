// api.js — única puerta hacia el servidor (H13).
// Ningún otro archivo llama a fetch. Aquí se centraliza:
//  - la URL base de la API versionada (/api/v1),
//  - el token de sesión en la cabecera Authorization,
//  - la revisión de response.ok y la conversión de errores.

const BASE = "/api/v1";
const CLAVE_TOKEN = "matricula.token";

export class ApiError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// ---------- Sesión ----------
// sessionStorage puede fallar (modo privado, almacenamiento bloqueado):
// por eso cada acceso va en try/catch y además se guarda una copia en memoria.
let tokenEnMemoria = null;

function leerToken() {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN) ?? tokenEnMemoria;
  } catch {
    return tokenEnMemoria;
  }
}

function guardarToken(token) {
  tokenEnMemoria = token;
  try {
    if (token) sessionStorage.setItem(CLAVE_TOKEN, token);
    else sessionStorage.removeItem(CLAVE_TOKEN);
  } catch {
    /* sin almacenamiento: queda solo en memoria */
  }
}

// Lee los datos visibles del token (rol, sub, mfa). Solo sirve para mostrar
// la interfaz; quien decide los permisos es siempre el servidor.
function datosDelToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
    const datos = JSON.parse(json);
    if (datos.exp && datos.exp * 1000 < Date.now()) return null;
    return datos;
  } catch {
    return null;
  }
}

export const sesion = {
  actual() {
    const token = leerToken();
    const datos = token ? datosDelToken(token) : null;
    if (token && !datos) guardarToken(null); // token vencido o corrupto
    return datos;
  },

  // Solo desarrollo: simula al proveedor de identidad (ADR-06).
  async iniciarDesarrollo({ rol, sub, mfa }) {
    const { token } = await peticion("POST", "/auth/dev-token", { rol, sub, mfa }, { base: "" });
    guardarToken(token);
    return datosDelToken(token);
  },

  cerrar() {
    guardarToken(null);
  },
};

// ---------- Petición genérica ----------
async function peticion(metodo, ruta, cuerpo, { base = BASE } = {}) {
  const cabeceras = { Accept: "application/json" };
  const token = leerToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";

  let respuesta;
  try {
    respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor.");
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    if (respuesta.status === 401 && base === BASE) {
      // La sesión ya no es válida; la interfaz lo detecta con sesion.actual().
      if (!datos?.error?.includes("MFA")) guardarToken(null);
    }
    throw new ApiError(respuesta.status, datos?.error ?? `Error ${respuesta.status}`);
  }
  return datos;
}

const conBusqueda = (ruta, { q = "", limit = 100 } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q) params.set("q", q);
  return `${ruta}?${params}`;
};

// ---------- Recursos ----------
export const estudiantes = {
  listar: (opciones) => peticion("GET", conBusqueda("/estudiantes", opciones)),
  crear: (datos) => peticion("POST", "/estudiantes", datos),
};

export const cursos = {
  listar: (opciones) => peticion("GET", conBusqueda("/cursos", opciones)),
  crear: (datos) => peticion("POST", "/cursos", datos),
};

export const matriculas = {
  listar: (opciones) => peticion("GET", conBusqueda("/matriculas", opciones)),
  crear: (datos) => peticion("POST", "/matriculas", datos),
};

export const reporte = {
  obtener: (opciones) => peticion("GET", conBusqueda("/reporte", opciones)),
};
