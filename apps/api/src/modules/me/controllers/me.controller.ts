import type { FastifyReply, FastifyRequest } from "fastify";

import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { apiSuccess } from "../../../shared/utils/api-response";
import { ProfileRepository } from "../../profiles/repositories/profile.repository";

export class MeController {
  private readonly profileRepository = new ProfileRepository();

  show = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.supabaseUser;

    if (!user) {
      throw new AppException(
        "Usuário autenticado não encontrado.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    let profile = await this.profileRepository.findById(user.id);

    if (!profile) {
      profile = await this.profileRepository.create({
        id: user.id,
        full_name:
          user.user_metadata?.nome_completo ||
          user.user_metadata?.name ||
          null,
        email: user.email ?? null,
        phone: user.user_metadata?.telefone ?? null,
        gender: user.user_metadata?.genero ?? null,
        avatar_url: null,
      });
    }

    return reply.status(200).send(
      apiSuccess({
        id: user?.id,
        email: user?.email,
        metadata: user?.user_metadata,
        profile,
      })
    );
  };
}