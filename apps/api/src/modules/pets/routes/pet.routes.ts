import type { FastifyInstance } from "fastify";

import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { PetController } from "../controllers/pet.controller";
import { createPetBodySchema, type CreatePetBody } from "../validators/create.validator";

export async function petRoutes(app: FastifyInstance) {
  const petController = new PetController();

  app.get(
    "/",
    { preHandler: [authenticateSupabaseUser] },
    petController.list
  );

  app.post<{ Body: CreatePetBody }>(
    "/",
    { preHandler: [authenticateSupabaseUser, validateBody(createPetBodySchema)] },
    petController.create
  );
}