INSERT INTO students (name, program, semester) VALUES
('Ana Torres', 'Software Engineering', 8),
('Luis Pérez', 'Software Engineering', 8),
('María Gómez', 'Information Technology', 6);

INSERT INTO courses (name, instructor, seats) VALUES
('Software Architecture', 'Eng. Carlos Ruiz', 30),
('Databases', 'Eng. Laura Vera', 25),
('Web Development', 'Eng. Pedro León', 1); -- only 1 seat, to test H04

INSERT INTO enrollments (student_id, course_id) VALUES
(1, 1),
(2, 1),
(1, 2);
