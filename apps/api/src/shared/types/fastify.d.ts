import type { User } from "../../modules/users/models/user.model";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
    sessionId?: string;
  }
}
