import type { FastifyInstance } from "fastify";

import { HealthController } from "../controllers/health.controller";

export async function healthRoutes(app: FastifyInstance) {
  const healthController = new HealthController();

  app.get("/", async () => ({
    status: "ok",
    service: "find-mypet-api",
  }));

  app.get("/db", healthController.checkDatabase);
}
