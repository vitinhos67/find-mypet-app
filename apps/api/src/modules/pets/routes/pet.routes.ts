import type { FastifyInstance } from "fastify";

import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { PetController } from "../controllers/pet.controller";
import { createPetBodySchema, type CreatePetBody } from "../validators/create.validator";

export async function petRoutes(app: FastifyInstance) {
  const petController = new PetController();
  app.addHook("onRequest", async (request) => {
    if (request.method === "DELETE" || request.method === "GET") {
      delete request.headers["content-type"];
    }
  });

  app.get(
    "/",
    { preHandler: [authenticateSupabaseUser] },
    petController.list
  );

  app.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [authenticateSupabaseUser] },
    petController.getById
  );

  app.post<{ Body: CreatePetBody }>(
    "/",
    { preHandler: [authenticateSupabaseUser, validateBody(createPetBodySchema)] },
    petController.create
  );

  app.put<{ Params: { id: string }, Body: CreatePetBody }>(
    "/:id",
    { preHandler: [authenticateSupabaseUser, validateBody(createPetBodySchema)] },
    petController.update
  );

  app.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [authenticateSupabaseUser] },
    petController.delete
  );

  app.post<{ Body: { base64: string; mimeType?: string } }>(
    "/upload-image",
    { preHandler: [authenticateSupabaseUser] },
    petController.uploadImage
  );
}