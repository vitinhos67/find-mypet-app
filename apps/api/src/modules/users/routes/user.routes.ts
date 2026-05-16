import type { FastifyInstance } from "fastify";

import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { UserController } from "../controllers/user.controller";
import { registerBodySchema } from "../validators/register.validator";

export async function userRoutes(app: FastifyInstance) {
  const userController = new UserController();

  app.post(
    "/register",
    { preHandler: validateBody(registerBodySchema) },
    userController.register
  );
}
