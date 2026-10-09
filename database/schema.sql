DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS estudiantes;

CREATE TABLE estudiantes (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  carrera VARCHAR(255) NOT NULL,
  semestre INT NOT NULL CHECK (semestre > 0)
);

CREATE TABLE cursos (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  docente VARCHAR(255) NOT NULL,
  cupos INT NOT NULL CHECK (cupos >= 0)
);

CREATE TABLE matriculas (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estudiante_id INT NOT NULL,
  curso_id INT NOT NULL,
  CONSTRAINT fk_estudiante
    FOREIGN KEY(estudiante_id) 
      REFERENCES estudiantes(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_curso
    FOREIGN KEY(curso_id) 
      REFERENCES cursos(id)
      ON DELETE CASCADE,
  UNIQUE(estudiante_id, curso_id)
);
