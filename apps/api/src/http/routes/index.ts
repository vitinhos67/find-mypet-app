import type { FastifyInstance } from "fastify";

import { alertRoutes } from '../../modules/alerts/routes/alert.routes';
import { deviceRoutes } from '../../modules/devices/routes/device.routes';
import { healthRoutes } from "../../modules/health/routes/health.routes";
import { locationRoutes } from "../../modules/locations/routes/location.routes";
import { meRoutes } from "../../modules/me/routes/me.routes";
import { petRoutes } from "../../modules/pets/routes/pet.routes";
import { safeZoneRoutes } from "../../modules/safe-zones/routes/safe-zone.routes";
import { mySharesRoutes, petShareRoutes } from "../../modules/shares/routes/share.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(
    async (api) => {
      await api.register(healthRoutes, { prefix: "/health" });
      await api.register(petRoutes, { prefix: "/pets" });
      await api.register(locationRoutes, { prefix: "/pets" });
      await api.register(petShareRoutes, { prefix: "/pets" });
      await api.register(safeZoneRoutes, { prefix: "/pets" });
      await api.register(mySharesRoutes, { prefix: "/shares" });
      await api.register(alertRoutes, { prefix: "/alerts" });
      await api.register(meRoutes, { prefix: "/me" });
      await api.register(deviceRoutes, { prefix: '/devices' });
    },
    { prefix: "/api" }
  );
}
