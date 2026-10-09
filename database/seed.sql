INSERT INTO estudiantes (nombre, carrera, semestre) VALUES
('Ana Torres', 'Ingeniería de Software', 8),
('Luis Pérez', 'Ingeniería de Software', 8),
('María Gómez', 'Tecnologías de la Información', 6);

INSERT INTO cursos (nombre, docente, cupos) VALUES
('Arquitectura de Software', 'Ing. Carlos Ruiz', 30),
('Bases de Datos', 'Ing. Laura Vera', 25),
('Desarrollo Web', 'Ing. Pedro León', 1); -- Setting 1 cupo for testing H04

INSERT INTO matriculas (estudiante_id, curso_id) VALUES
(1, 1),
(2, 1),
(1, 2);
