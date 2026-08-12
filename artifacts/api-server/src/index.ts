import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env["PORT"] ?? "8080");

if (Number.isNaN(port) || port <= 0) {
  logger.error(`Invalid PORT value: "${process.env["PORT"]}" — using 8080`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
