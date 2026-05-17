import type { FastifyInstance } from "fastify";

import { authenticate } from "../../../shared/middlewares/authenticate.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { AuthController } from "../controllers/auth.controller";
import { loginBodySchema } from "../validators/login.validator";

export async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController();

  app.post(
    "/login",
    { preHandler: validateBody(loginBodySchema) },
    authController.login
  );

  app.post(
    "/logout",
    { preHandler: authenticate({ optional: true }) },
    authController.logout
  );

  app.get("/me", { preHandler: authenticate() }, authController.me);
}
