import type { FastifyInstance } from "fastify";
import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { SafeZoneController } from "../controllers/safe-zone.controller";
import { upsertSafeZoneSchema, type UpsertSafeZoneBody } from "../validators/safe-zone.validator";

const ctrl = new SafeZoneController();

export async function safeZoneRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    if (request.method === "GET" || request.method === "DELETE") {
      delete request.headers["content-type"];
    }
  });

  // POST /api/pets/:petId/safe-zone
  app.post<{ Params: { petId: string }; Body: UpsertSafeZoneBody }>(
    "/:petId/safe-zone",
    { preHandler: [authenticateSupabaseUser, validateBody(upsertSafeZoneSchema)] },
    ctrl.upsert
  );

  // GET /api/pets/:petId/safe-zone
  app.get<{ Params: { petId: string } }>(
    "/:petId/safe-zone",
    { preHandler: [authenticateSupabaseUser] },
    ctrl.get
  );

  // DELETE /api/pets/:petId/safe-zone
  app.delete<{ Params: { petId: string } }>(
    "/:petId/safe-zone",
    { preHandler: [authenticateSupabaseUser] },
    ctrl.delete
  );
}
