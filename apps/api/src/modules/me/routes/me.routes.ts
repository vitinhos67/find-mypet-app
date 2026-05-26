import type { FastifyInstance } from "fastify";

import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { MeController } from "../controllers/me.controller";

export async function meRoutes(app: FastifyInstance) {
  const meController = new MeController();

  app.get(
    "/",
    {
      preHandler: authenticateSupabaseUser,
    },
    meController.show
  );
}