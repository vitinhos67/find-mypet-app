import type { FastifyInstance } from "fastify";

import { authRoutes } from "../../modules/auth/routes/auth.routes";
import { deviceRoutes } from '../../modules/devices/routes/device.routes';
import { healthRoutes } from "../../modules/health/routes/health.routes";
import { meRoutes } from "../../modules/me/routes/me.routes";
import { petRoutes } from "../../modules/pets/routes/pet.routes";
import { userRoutes } from "../../modules/users/routes/user.routes";
export async function registerRoutes(app: FastifyInstance) {
  await app.register(
    async (api) => {
      api.get("/health", async () => ({
        status: "ok",
        service: "find-mypet-api",
      }));
      
      await api.register(healthRoutes, { prefix: "/health" });
      await api.register(authRoutes, { prefix: "/auth" });
      await api.register(userRoutes, { prefix: "/users" });
      await api.register(petRoutes, { prefix: "/pets" });
      await api.register(meRoutes, { prefix: "/me" });
      await app.register(deviceRoutes, { prefix: '/devices' });
    },
    { prefix: "/api" }
  );
}
