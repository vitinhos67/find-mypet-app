import type { FastifyReply, FastifyRequest } from "fastify";

import { getSessionCookieOptions } from "../../../shared/config/session-cookie.config";
import { env } from "../../../shared/env/env";
import { apiSuccess } from "../../../shared/utils/api-response";
import { AuthService } from "../services/auth.service";
import type { LoginBody } from "../validators/login.validator";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) => {
    const { user, sessionId } = await this.authService.login(request.body);

    reply.setCookie(env.COOKIE_NAME, sessionId, getSessionCookieOptions());

    return reply
      .status(200)
      .send(apiSuccess(user, "Login realizado com sucesso."));
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.sessionId) {
      await this.authService.logout(request.sessionId);
    }

    reply.clearCookie(env.COOKIE_NAME, {
      path: "/",
      signed: true,
    });

    return reply
      .status(200)
      .send(apiSuccess(null, "Logout realizado com sucesso."));
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await this.authService.getAuthenticatedUser(request.user!.id);

    return reply.status(200).send(apiSuccess(user));
  };
}
