import type { FastifyInstance } from "fastify";

import { deviceRoutes } from '../../modules/devices/routes/device.routes';
import { healthRoutes } from "../../modules/health/routes/health.routes";
import { locationRoutes } from "../../modules/locations/routes/location.routes";
import { meRoutes } from "../../modules/me/routes/me.routes";
import { petRoutes } from "../../modules/pets/routes/pet.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(
    async (api) => {
      await api.register(healthRoutes, { prefix: "/health" });
      await api.register(petRoutes, { prefix: "/pets" });
      await api.register(locationRoutes, { prefix: "/pets" });
      await api.register(meRoutes, { prefix: "/me" });
      await app.register(deviceRoutes, { prefix: '/devices' });
    },
    { prefix: "/api" }
  );
}
