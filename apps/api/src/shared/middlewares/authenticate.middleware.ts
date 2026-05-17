import type { FastifyReply, FastifyRequest } from "fastify";

import { SessionRepository } from "../../modules/auth/repositories/session.repository";
import { UserRepository } from "../../modules/users/repositories/user.repository";
import { env } from "../env/env";
import { AppException } from "../exceptions/app.exception";
import { ErrorCodes } from "../exceptions/error-codes";

type AuthenticateOptions = {
  optional?: boolean;
};

export function authenticate(options: AuthenticateOptions = {}) {
  const sessionRepository = new SessionRepository();
  const userRepository = new UserRepository();

  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const rawCookie = request.cookies[env.COOKIE_NAME];

    if (!rawCookie) {
      if (options.optional) {
        return;
      }

      throw new AppException(
        "Não autenticado.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const unsigned = request.unsignCookie(rawCookie);

    if (!unsigned.valid || !unsigned.value) {
      if (options.optional) {
        return;
      }

      throw new AppException(
        "Sessão inválida.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const session = await sessionRepository.findValid(unsigned.value);

    if (!session) {
      if (options.optional) {
        return;
      }

      throw new AppException(
        "Sessão expirada.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const user = await userRepository.findById(session.userId);

    if (!user) {
      if (options.optional) {
        return;
      }

      throw new AppException(
        "Usuário não encontrado.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    request.sessionId = session.id;
    request.user = user;
  };
}
