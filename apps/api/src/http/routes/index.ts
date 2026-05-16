import type { FastifyInstance } from "fastify";

import { healthRoutes } from "../../modules/health/routes/health.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes, { prefix: "/health" });
}
