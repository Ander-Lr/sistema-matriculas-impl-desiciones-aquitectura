// Central error handler (H07, H08). Translates business and PostgreSQL errors
// into clear HTTP responses and never exposes internal details.
const PG_ERRORS = {
  "23505": [409, "The record already exists."],             // UNIQUE (e.g. duplicate enrollment)
  "23503": [404, "The related record does not exist."],     // FOREIGN KEY (H11)
  "23514": [422, "The data does not satisfy the rules."],   // CHECK
  "22P02": [422, "Invalid data format."],
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (PG_ERRORS[err.code]) {
    const [status, error] = PG_ERRORS[err.code];
    return res.status(status).json({ error });
  }

  // Malformed JSON in the request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body is not valid JSON." });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
  res.status(status).json({ error: err.message });
};
