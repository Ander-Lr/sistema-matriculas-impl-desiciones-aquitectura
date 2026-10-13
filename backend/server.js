import app from "./app.js";
import { config } from "./config/config.js";

app.listen(config.port, config.host, () => {
  console.log(`System running at http://${config.host}:${config.port} (${config.environment})`);
});
