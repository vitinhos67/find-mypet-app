import type { FastifyInstance } from "fastify";

import { authenticate } from "../../../shared/middlewares/authenticate.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { PetController } from "../controllers/pet.controller";
import { createPetBodySchema } from "../validators/create.validator";

export async function petRoutes(app: FastifyInstance) {
  const petController = new PetController();

  app.post(
    "/",
    { preHandler: [authenticate(), validateBody(createPetBodySchema)] },
    petController.create
  );
}
