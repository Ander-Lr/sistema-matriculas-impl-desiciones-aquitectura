// api.js — the single gateway to the server (H13).
// No other file calls fetch. This module centralizes:
//  - the base URL of the versioned API (/api/v1),
//  - the session token in the Authorization header,
//  - the response.ok check and error conversion.

const BASE = "/api/v1";
const TOKEN_KEY = "enrollment.token";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ---------- Session ----------
// sessionStorage can fail (private mode, blocked storage), so every access is
// wrapped in try/catch and a copy is also kept in memory.
let tokenInMemory = null;

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? tokenInMemory;
  } catch {
    return tokenInMemory;
  }
}

function saveToken(token) {
  tokenInMemory = token;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* no storage: kept in memory only */
  }
}

// Reads the visible token claims (role, sub, mfa). Only used to adapt the
// interface; the server always makes the permission decisions.
function tokenClaims(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
    const claims = JSON.parse(json);
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export const session = {
  current() {
    const token = readToken();
    const claims = token ? tokenClaims(token) : null;
    if (token && !claims) saveToken(null); // expired or corrupted token
    return claims;
  },

  // Development only: simulates the identity provider (ADR-06).
  async signInDev({ role, sub, mfa }) {
    const { token } = await request("POST", "/auth/dev-token", { role, sub, mfa }, { base: "" });
    saveToken(token);
    return tokenClaims(token);
  },

  signOut() {
    saveToken(null);
  },
};

// ---------- Generic request ----------
async function request(method, path, body, { base = BASE } = {}) {
  const headers = { Accept: "application/json" };
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not connect to the server.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && base === BASE) {
      // The session is no longer valid; the interface detects it with session.current().
      if (!data?.error?.includes("MFA")) saveToken(null);
    }
    throw new ApiError(response.status, data?.error ?? `Error ${response.status}`);
  }
  return data;
}

const withSearch = (path, { q = "", limit = 100 } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q) params.set("q", q);
  return `${path}?${params}`;
};

// ---------- Resources ----------
export const students = {
  list: (options) => request("GET", withSearch("/students", options)),
  create: (data) => request("POST", "/students", data),
};

export const courses = {
  list: (options) => request("GET", withSearch("/courses", options)),
  create: (data) => request("POST", "/courses", data),
};

export const enrollments = {
  list: (options) => request("GET", withSearch("/enrollments", options)),
  create: (data) => request("POST", "/enrollments", data),
};

export const report = {
  get: (options) => request("GET", withSearch("/report", options)),
};
