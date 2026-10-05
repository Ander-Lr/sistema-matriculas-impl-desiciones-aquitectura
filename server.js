const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

let estudiantes = [
  {
    id: 1,
    nombre: "Ana Torres",
    carrera: "Ingeniería de Software",
    semestre: 8
  },
  {
    id: 2,
    nombre: "Luis Pérez",
    carrera: "Ingeniería de Software",
    semestre: 8
  },
  {
    id: 3,
    nombre: "María Gómez",
    carrera: "Tecnologías de la Información",
    semestre: 6
  }
];

let cursos = [
  {
    id: 1,
    nombre: "Arquitectura de Software",
    docente: "Ing. Carlos Ruiz",
    cupos: 30
  },
  {
    id: 2,
    nombre: "Bases de Datos",
    docente: "Ing. Laura Vera",
    cupos: 25
  },
  {
    id: 3,
    nombre: "Desarrollo Web",
    docente: "Ing. Pedro León",
    cupos: 35
  }
];

let matriculas = [
  {
    id: 1,
    estudianteId: 1,
    cursoId: 1
  },
  {
    id: 2,
    estudianteId: 2,
    cursoId: 1
  },
  {
    id: 3,
    estudianteId: 1,
    cursoId: 2
  }
];

app.get("/api/estudiantes", (req, res) => {
  res.json(estudiantes);
});

app.post("/api/estudiantes", (req, res) => {

  const {
    nombre,
    carrera,
    semestre
  } = req.body;

  const estudiante = {
    id: estudiantes.length
      ? Math.max(...estudiantes.map(e => e.id)) + 1
      : 1,

    nombre,
    carrera,
    semestre: Number(semestre)
  };

  estudiantes.push(estudiante);

  res.status(201).json(estudiante);
});

app.get("/api/cursos", (req, res) => {
  res.json(cursos);
});

app.post("/api/cursos", (req, res) => {

  const {
    nombre,
    docente,
    cupos
  } = req.body;

  const curso = {

    id: cursos.length
      ? Math.max(...cursos.map(c => c.id)) + 1
      : 1,

    nombre,
    docente,
    cupos: Number(cupos)
  };

  cursos.push(curso);

  res.status(201).json(curso);
});

app.get("/api/matriculas", (req, res) => {

  const resultado = matriculas.map(m => {

    const estudiante =
      estudiantes.find(
        e => e.id === m.estudianteId
      );

    const curso =
      cursos.find(
        c => c.id === m.cursoId
      );

    return {

      id: m.id,

      estudiante:
        estudiante
          ? estudiante.nombre
          : "Desconocido",

      curso:
        curso
          ? curso.nombre
          : "Desconocido"
    };

  });

  res.json(resultado);
});


app.post("/api/matriculas", (req, res) => {

  const {
    estudianteId,
    cursoId
  } = req.body;

  const estudiante =
    estudiantes.find(
      e => e.id === Number(estudianteId)
    );

  const curso =
    cursos.find(
      c => c.id === Number(cursoId)
    );

  if (!estudiante || !curso) {

    return res.status(400).json({
      error: "Estudiante o curso no encontrado."
    });

  }

  if (
    matriculas.some(
      m =>
        m.estudianteId === estudiante.id &&
        m.cursoId === curso.id
    )
  ) {

    return res.status(400).json({
      error:
        "El estudiante ya está matriculado en el curso."
    });

  }

  matriculas.push({

    id: matriculas.length
      ? Math.max(...matriculas.map(m => m.id)) + 1
      : 1,

    estudianteId: estudiante.id,

    cursoId: curso.id

  });

  res.status(201).json({

    mensaje:
      "Matrícula registrada correctamente."

  });

});

app.get("/api/reporte", (req, res) => {

  const reporte =
    estudiantes.map(estudiante => {

      const cursosEstudiante =
        matriculas

          .filter(
            m =>
              m.estudianteId ===
              estudiante.id
          )

          .map(m => {

            const curso =
              cursos.find(
                c =>
                  c.id === m.cursoId
              );

            return curso
              ? curso.nombre
              : "Sin curso";

          });

      return {

        estudiante:
          estudiante.nombre,

        carrera:
          estudiante.carrera,

        cursos:
          cursosEstudiante

      };

    });

  res.json(reporte);
});

// ================================
// INICIAR SERVIDOR
// ================================

app.listen(PORT, () => {

  console.log(
    `Sistema ejecutándose en http://localhost:${PORT}`
  );

});