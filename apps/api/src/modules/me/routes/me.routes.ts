import type { FastifyInstance } from "fastify";

import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { MeController } from "../controllers/me.controller";
import { updateProfileBodySchema } from "../validators/update-profile.validator";
import type { UpdateProfileBody } from "../validators/update-profile.validator";

export async function meRoutes(app: FastifyInstance) {
  const meController = new MeController();

  app.get(
    "/",
    {
      preHandler: authenticateSupabaseUser,
    },
    meController.show
  );

  app.patch<{ Body: UpdateProfileBody }>(
    "/profile",
    {
      preHandler: [
        authenticateSupabaseUser,
        validateBody(updateProfileBodySchema),
      ],
    },
    meController.updateProfile
  );
}
