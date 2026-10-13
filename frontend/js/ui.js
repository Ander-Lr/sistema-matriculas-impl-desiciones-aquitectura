// ui.js — everything that is drawn on screen (View).
// Security rule (H05): data coming from the server is ALWAYS inserted with
// textContent. This file never uses innerHTML, so a name such as
// <img src=x onerror=alert(1)> is displayed as text and never executed.

// Creates an element with attributes and safe text content.
export function el(tag, { text, className, attributes = {} } = {}, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  for (const child of children) node.append(child);
  return node;
}

// Fills a <tbody> with one row per record. "columns" are the keys to display.
export function renderTable(tbody, records, columns, emptyText = "No records.") {
  if (!records.length) {
    const cell = el("td", { text: emptyText, className: "text-body-secondary", attributes: { colspan: String(columns.length) } });
    tbody.replaceChildren(el("tr", {}, [cell]));
    return;
  }
  const rows = records.map((record) =>
    el("tr", {}, columns.map((column) => el("td", { text: record[column] })))
  );
  tbody.replaceChildren(...rows);
}

export function fillSelect(select, records, { value = "id", label = "name", placeholder = "Select…" } = {}) {
  const previous = select.value;
  const options = records.map((r) => el("option", { text: `${r[value]} · ${r[label]}`, attributes: { value: String(r[value]) } }));
  select.replaceChildren(el("option", { text: placeholder, attributes: { value: "" } }), ...options);
  if (records.some((r) => String(r[value]) === previous)) select.value = previous;
}

// Shows a Bootstrap alert message: "success", "danger", "warning", "info".
export function showMessage(container, text, type = "info") {
  if (!text) {
    container.replaceChildren();
    return;
  }
  container.replaceChildren(el("div", { text, className: `alert alert-${type} py-2 mb-0`, attributes: { role: "alert" } }));
}

export function renderReport(container, rows) {
  if (!rows.length) {
    container.replaceChildren(el("p", { text: "No students to display.", className: "text-body-secondary" }));
    return;
  }
  const items = rows.map((row) =>
    el("div", { className: "list-group-item" }, [
      el("strong", { text: row.student }),
      el("span", { text: ` — ${row.program}`, className: "text-body-secondary" }),
      el("div", { text: `Courses: ${row.courses.length ? row.courses.join(", ") : "None"}`, className: "small" }),
    ])
  );
  container.replaceChildren(...items);
}

const ROLE_NAMES = { staff: "Administrative staff", student: "Student" };

// Adapts the interface to the session: shows who is signed in and hides the
// controls their role cannot use. This is only a visual convenience: the
// server checks the permissions again on every request (ADR-06).
export function renderSession(claims) {
  const signedIn = Boolean(claims);
  document.querySelector("#signInForm").hidden = signedIn;
  document.querySelector("#activeSession").hidden = !signedIn;
  document.querySelector("#sessionNotice").hidden = signedIn;
  document.querySelector("main").classList.toggle("signed-out", !signedIn);

  document.querySelector("#sessionText").textContent = signedIn
    ? `${ROLE_NAMES[claims.role] ?? claims.role} · ID ${claims.sub}${claims.mfa ? " · MFA ✓" : " · no MFA"}`
    : "";

  for (const element of document.querySelectorAll("[data-role]")) {
    element.hidden = signedIn && claims.role !== element.dataset.role;
  }
}

export function clearAll() {
  for (const id of ["#studentsTable", "#coursesTable", "#enrollmentsTable", "#report", "#studentSelect", "#courseSelect"]) {
    document.querySelector(id).replaceChildren();
  }
  for (const id of ["#studentMessage", "#courseMessage", "#enrollmentMessage", "#reportMessage"]) {
    document.querySelector(id).replaceChildren();
  }
  for (const search of document.querySelectorAll('input[type="search"]')) search.value = "";
}
