import type { FastifyInstance } from "fastify";

import { healthRoutes } from "../../modules/health/routes/health.routes";
import { userRoutes } from "../../modules/users/routes/user.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(
    async (api) => {
      api.get("/health", async () => ({
        status: "ok",
        service: "find-mypet-api",
      }));

      await api.register(healthRoutes, { prefix: "/health" });
      await api.register(userRoutes, { prefix: "/users" });
    },
    { prefix: "/api" }
  );
}
