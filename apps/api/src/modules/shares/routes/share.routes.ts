import type { FastifyInstance } from "fastify";
import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { ShareController } from "../controllers/share.controller";
import { createShareBodySchema, updatePermissionBodySchema, type CreateShareBody, type UpdatePermissionBody } from "../validators/share.validator";

const shareController = new ShareController();

// Rotas em /api/pets/:petId/shares
export async function petShareRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    if (request.method === "DELETE" || request.method === "GET") {
      delete request.headers["content-type"];
    }
  });

  app.post<{ Params: { petId: string }; Body: CreateShareBody }>(
    "/:petId/shares",
    { preHandler: [authenticateSupabaseUser, validateBody(createShareBodySchema)] },
    shareController.create
  );

  app.get<{ Params: { petId: string } }>(
    "/:petId/shares",
    { preHandler: [authenticateSupabaseUser] },
    shareController.list
  );

  app.delete<{ Params: { petId: string; shareId: string } }>(
    "/:petId/shares/:shareId",
    { preHandler: [authenticateSupabaseUser] },
    shareController.remove
  );

  app.patch<{ Params: { petId: string; shareId: string }; Body: UpdatePermissionBody }>(
    "/:petId/shares/:shareId",
    { preHandler: [authenticateSupabaseUser, validateBody(updatePermissionBodySchema)] },
    shareController.updatePermission
  );
}

// Rotas em /api/shares
export async function mySharesRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    if (request.method === "GET") {
      delete request.headers["content-type"];
    }
  });

  app.get(
    "/",
    { preHandler: [authenticateSupabaseUser] },
    shareController.listSharedWithMe
  );
}
