import type { FastifyReply, FastifyRequest } from "fastify";

import { apiSuccess } from "../../../shared/utils/api-response";

export class MeController {
  show = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.supabaseUser;

    return reply.status(200).send(
      apiSuccess({
        id: user?.id,
        email: user?.email,
        metadata: user?.user_metadata,
      })
    );
  };
}