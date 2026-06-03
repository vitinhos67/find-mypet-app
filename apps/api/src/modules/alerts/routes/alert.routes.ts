import type { FastifyInstance } from "fastify";
import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { AlertController } from "../controllers/alert.controller";

const ctrl = new AlertController();

export async function alertRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    if (request.method === "GET" || request.method === "PATCH") {
      delete request.headers["content-type"];
    }
  });

  app.get("/", { preHandler: [authenticateSupabaseUser] }, ctrl.listUnread);
  app.patch("/read-all", { preHandler: [authenticateSupabaseUser] }, ctrl.markAllRead);
  app.patch<{ Params: { alertId: string } }>(
    "/:alertId/read",
    { preHandler: [authenticateSupabaseUser] },
    ctrl.markRead
  );
}
