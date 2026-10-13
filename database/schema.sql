-- University Enrollment System schema (ADR-03).
-- The integrity rules live in the database (H02, H09, H11).
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  program  VARCHAR(255) NOT NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 12)
);

CREATE TABLE courses (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  seats      INT NOT NULL CHECK (seats >= 0)
);

CREATE TABLE enrollments (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
  CONSTRAINT uq_enrollment UNIQUE (student_id, course_id)
);
