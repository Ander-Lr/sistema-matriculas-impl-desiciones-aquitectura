import app from "./app.js";
import { config } from "./config/config.js";

app.listen(config.puerto, config.host, () => {
  console.log(`Sistema ejecutándose en http://${config.host}:${config.puerto} (${config.entorno})`);
});
