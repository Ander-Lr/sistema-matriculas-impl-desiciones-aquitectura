// main.js — events: connects the forms and buttons with api.js and ui.js.
import { session, students, courses, enrollments, report } from "./api.js";
import { renderTable, fillSelect, showMessage, renderReport, renderSession, clearAll } from "./ui.js";

const $ = (selector) => document.querySelector(selector);

// Search box text (?q=)
const filters = { students: "", courses: "", enrollments: "" };

// Shows the error in the given container and, if the session expired, returns to the start.
function handleError(container, error) {
  showMessage(container, error.message, error.status >= 500 || error.status === 0 ? "danger" : "warning");
  if (error.status === 401 && !session.current()) {
    renderSession(null);
    clearAll();
  }
}

// ---------- Data loading ----------
async function loadStudents() {
  try {
    const list = await students.list({ q: filters.students });
    renderTable($("#studentsTable"), list, ["id", "name", "program", "semester"]);
  } catch (error) {
    handleError($("#studentMessage"), error);
  }
}

async function loadCourses() {
  try {
    const list = await courses.list({ q: filters.courses });
    renderTable($("#coursesTable"), list, ["id", "name", "instructor", "seats"]);
  } catch (error) {
    handleError($("#courseMessage"), error);
  }
}

async function loadEnrollments() {
  try {
    const list = await enrollments.list({ q: filters.enrollments });
    renderTable($("#enrollmentsTable"), list, ["id", "student", "course"]);
  } catch (error) {
    handleError($("#enrollmentMessage"), error);
  }
}

// The enrollment <select> elements use the full lists (no search filter).
async function loadSelects() {
  try {
    const [studentList, courseList] = await Promise.all([students.list(), courses.list()]);
    const user = session.current();
    // A student can only enroll themselves: only their own record is shown.
    const visible = user?.role === "student"
      ? studentList.filter((s) => String(s.id) === String(user.sub))
      : studentList;
    fillSelect($("#studentSelect"), visible, { placeholder: "Student…" });
    fillSelect($("#courseSelect"), courseList.map((c) => ({ ...c, name: `${c.name} (${c.seats} seats)` })), { placeholder: "Course…" });
  } catch (error) {
    handleError($("#enrollmentMessage"), error);
  }
}

function loadAll() {
  return Promise.all([loadStudents(), loadCourses(), loadEnrollments(), loadSelects()]);
}

// ---------- Forms ----------
// Submits a form, shows the result and reloads what is needed.
function onSubmit(form, container, action, successMessage, reload) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const result = await action();
      showMessage(container, typeof successMessage === "function" ? successMessage(result) : successMessage, "success");
      form.reset();
      await reload();
    } catch (error) {
      handleError(container, error);
    } finally {
      button.disabled = false;
    }
  });
}

onSubmit(
  $("#studentForm"),
  $("#studentMessage"),
  () => students.create({
    name: $("#studentName").value,
    program: $("#studentProgram").value,
    semester: Number($("#studentSemester").value),
  }),
  (s) => `Student registered with ID ${s.id}.`,
  () => Promise.all([loadStudents(), loadSelects()])
);

onSubmit(
  $("#courseForm"),
  $("#courseMessage"),
  () => courses.create({
    name: $("#courseName").value,
    instructor: $("#courseInstructor").value,
    seats: Number($("#courseSeats").value),
  }),
  (c) => `Course registered with ID ${c.id}.`,
  () => Promise.all([loadCourses(), loadSelects()])
);

onSubmit(
  $("#enrollmentForm"),
  $("#enrollmentMessage"),
  () => enrollments.create({
    studentId: Number($("#studentSelect").value),
    courseId: Number($("#courseSelect").value),
  }),
  (r) => r.message,
  () => Promise.all([loadEnrollments(), loadCourses(), loadSelects()])
);

// ---------- Report ----------
$("#reportButton").addEventListener("click", async () => {
  showMessage($("#reportMessage"), "");
  try {
    renderReport($("#report"), await report.get());
  } catch (error) {
    handleError($("#reportMessage"), error);
  }
});

// ---------- Search boxes ----------
// Wait 300 ms after the last keystroke so a request is not sent for every letter.
function searchBox(input, key, load) {
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      filters[key] = input.value.trim();
      load();
    }, 300);
  });
}

searchBox($("#studentSearch"), "students", loadStudents);
searchBox($("#courseSearch"), "courses", loadCourses);
searchBox($("#enrollmentSearch"), "enrollments", loadEnrollments);

// ---------- Session ----------
$("#signInForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const claims = await session.signInDev({
      role: $("#sessionRole").value,
      sub: $("#sessionSub").value || "1",
      mfa: $("#sessionMfa").checked,
    });
    renderSession(claims);
    await loadAll();
  } catch (error) {
    $("#sessionNotice").textContent = `Could not sign in: ${error.message}`;
  }
});

$("#signOutButton").addEventListener("click", () => {
  session.signOut();
  renderSession(null);
  clearAll();
  Object.keys(filters).forEach((key) => { filters[key] = ""; });
  $("#sessionNotice").textContent = "Sign in to view and register information.";
});

// ---------- Startup ----------
const initialUser = session.current();
renderSession(initialUser);
if (initialUser) loadAll();
