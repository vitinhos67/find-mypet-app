import type { FastifyInstance } from "fastify";

import { healthRoutes } from "../../modules/health/routes/health.routes";
import { userRoutes } from "../../modules/users/routes/user.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(userRoutes, { prefix: "/users" });
}
