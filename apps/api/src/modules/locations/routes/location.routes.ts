import type { FastifyInstance } from "fastify";

import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { LocationController } from "../controllers/location.controller";

export async function locationRoutes(app: FastifyInstance) {
  const locationController = new LocationController();

  app.addHook("onRequest", async (request) => {
    if (request.method === "GET") {
      delete request.headers["content-type"];
    }
  });

  // Retorna a última localização do pet buscando via coleira vinculada
  app.get<{ Params: { id: string } }>(
    "/:id/location",
    { preHandler: [authenticateSupabaseUser] },
    locationController.get
  );
  app.post(
    "/device",
    locationController.saveForDevice
  );
}
