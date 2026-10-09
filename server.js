const express = require("express");
const path = require("path");
const apiRoutes = require("./routes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas de la API
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Sistema ejecutándose en http://localhost:${PORT}`);
});