import type { FastifyReply, FastifyRequest } from "fastify";

import { apiSuccess } from "../../../shared/utils/api-response";
import { UserService } from "../services/user.service";
import type { RegisterBody } from "../validators/register.validator";

export class UserController {
  constructor(private readonly userService = new UserService()) {}

  register = async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) => {
    const user = await this.userService.register(request.body);

    return reply
      .status(201)
      .send(apiSuccess(user, "Usuário registrado com sucesso."));
  };
}
