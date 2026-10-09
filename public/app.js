async function getJSON(url) {
  const response =
    await fetch(url);
  return response.json();
}


// =====================================
// CARGAR INFORMACIÓN
// =====================================

async function cargarTodo() {
  const estudiantes =
    await getJSON(
      "/api/estudiantes"
    );
  const cursos =
    await getJSON(
      "/api/cursos"
    );
  const matriculas =
    await getJSON(
      "/api/matriculas"
    );
  // ESTUDIANTES
  document.querySelector(
    "#tablaEstudiantes"
  ).innerHTML =
    estudiantes.map(e =>
      `
      <tr>
        <td>${e.id}</td>
        <td>
          ${e.nombre}
        </td>
        <td>
          ${e.carrera}
        </td>
        <td>
          ${e.semestre}
        </td>
      </tr>
      `
    ).join("");
  // CURSOS
  document.querySelector(
    "#tablaCursos"
  ).innerHTML =
    cursos.map(c =>
      `
      <tr>
        <td>
          ${c.id}
        </td>
        <td>
          ${c.nombre}
        </td>
        <td>
          ${c.docente}
        </td>
        <td>
          ${c.cupos}
        </td>
      </tr>
      `
    ).join("");
  // MATRÍCULAS
  document.querySelector(
    "#tablaMatriculas"
  ).innerHTML =
    matriculas.map(m =>
      `
      <tr>
        <td>
          ${m.id}
        </td>
        <td>
          ${m.estudiante}
        </td>
        <td>
          ${m.curso}
        </td>
      </tr>
      `
    ).join("");
  // SELECT ESTUDIANTES
  document.querySelector(
    "#estudianteSelect"
  ).innerHTML =
    estudiantes.map(e =>
      `
      <option value="${e.id}">
        ${e.nombre}
      </option>
      `
    ).join("");
  // SELECT CURSOS
  document.querySelector(
    "#cursoSelect"
  ).innerHTML =
    cursos.map(c =>
      `
      <option value="${c.id}">
        ${c.nombre}
      </option>
      `
    ).join("");
}
// =====================================
// AGREGAR ESTUDIANTE
// =====================================
document
  .querySelector("#formEstudiante")
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();
      await fetch(
        "/api/estudiantes",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            nombre:
              document.querySelector(
                "#nombre"
              ).value,
            carrera:
              document.querySelector(
                "#carrera"
              ).value,
            semestre:
              document.querySelector(
                "#semestre"
              ).value
          })

        }
      );
      event.target.reset();
      cargarTodo();
    }
  );
// =====================================
// AGREGAR CURSO
// =====================================
document
  .querySelector("#formCurso")
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();
      await fetch(
        "/api/cursos",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            nombre:
              document.querySelector(
                "#curso"
              ).value,
            docente:
              document.querySelector(
                "#docente"
              ).value,
            cupos:
              document.querySelector(
                "#cupos"
              ).value
          })

        }
      );
      event.target.reset();
      cargarTodo();
    }
  );

// =====================================
// MATRÍCULA
// =====================================
document
  .querySelector("#formMatricula")
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();
      const response =
        await fetch(
          "/api/matriculas",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              estudianteId:
                document.querySelector(
                  "#estudianteSelect"
                ).value,
              cursoId:
                document.querySelector(
                  "#cursoSelect"
                ).value
            })
          }
        );
      const data =
        await response.json();
      document.querySelector(
        "#mensaje"
      ).textContent =
        data.mensaje ||
        data.error;
      cargarTodo();
    }
  );


// =====================================
// REPORTE
// =====================================

document
  .querySelector("#btnReporte")
  .addEventListener(
    "click",
    async () => {
      const reporte =
        await getJSON(
          "/api/reporte"
        );
      document.querySelector(
        "#reporte"
      ).innerHTML =
        reporte.map(r =>
          `
          <div class="reporte-item">

            <strong>
              ${r.estudiante}
            </strong>
            —
            ${r.carrera}
            <br>
            Cursos:
            ${r.cursos.length
            ? r.cursos.join(", ")
            : "Ninguno"
          }
          </div>
          `
        ).join("");

    }
  );


// =====================================
// INICIALIZAR
// =====================================

cargarTodo();