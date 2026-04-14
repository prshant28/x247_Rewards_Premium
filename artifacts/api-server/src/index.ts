import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./lib/seed";

const port = Number(process.env["PORT"] ?? 8080);

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await seedDatabase();
});
