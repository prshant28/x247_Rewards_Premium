import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./lib/seed";

const port = Number(process.env["PORT"] ?? 8080);

async function seedWithRetry(maxAttempts = 8, baseDelayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await seedDatabase();
      return;
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const isEndpointDisabled =
        msg.includes("endpoint has been disabled") ||
        msg.includes("endpoint is disabled") ||
        msg.includes("connection refused") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("too many connections");

      if (isEndpointDisabled && attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(1.8, attempt - 1);
        logger.warn({ attempt, delay: Math.round(delay) }, "DB endpoint not ready, retrying seed...");
        await new Promise(r => setTimeout(r, delay));
      } else {
        logger.error({ err, attempt }, "Seed failed (non-fatal), server will continue");
        return;
      }
    }
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  seedWithRetry().catch(err => logger.error({ err }, "Seed retry loop failed (non-fatal)"));
});
