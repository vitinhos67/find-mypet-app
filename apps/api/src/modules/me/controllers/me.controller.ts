import type { FastifyReply, FastifyRequest } from "fastify";

import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import { apiSuccess } from "../../../shared/utils/api-response";
import { ProfileRepository } from "../../profiles/repositories/profile.repository";
import type { UpdateProfileBody } from "../validators/update-profile.validator";

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

  updateProfile = async (
    request: FastifyRequest<{ Body: UpdateProfileBody }>,
    reply: FastifyReply
  ) => {
    const user = request.supabaseUser;

    if (!user) {
      throw new AppException(
        "Usuário autenticado não encontrado.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const currentProfile = await this.profileRepository.findById(user.id);

    if (!currentProfile) {
      await this.profileRepository.create({
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

    const profile = await this.profileRepository.updateById(
      user.id,
      request.body
    );

    return reply
      .status(200)
      .send(apiSuccess(profile, "Perfil atualizado com sucesso."));
  };

  uploadAvatar = async (
    request: FastifyRequest<{ Body: { base64: string; mimeType?: string; extension?: string } }>,
    reply: FastifyReply
  ) => {
    const user = request.supabaseUser;

    if (!user) {
      throw new AppException("Usuário não autenticado.", 401, ErrorCodes.UNAUTHORIZED);
    }

    const { base64, mimeType, extension } = request.body;

    if (!base64) {
      throw new AppException("Campo 'base64' é obrigatório.", 400, ErrorCodes.VALIDATION_ERROR);
    }

    const ext = extension || "jpg";
    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;
    const buffer = Buffer.from(base64, "base64");

    const { error } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, buffer, { contentType: mimeType || "image/jpeg", upsert: false });

    if (error) {
      throw new AppException("Falha ao fazer upload do avatar.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const profile = await this.profileRepository.updateById(user.id, { avatar_url: publicUrl });

    return reply.status(200).send(apiSuccess(profile, "Avatar atualizado com sucesso."));
  };

  saveFcmToken = async (
    request: FastifyRequest<{ Body: { fcm_token: string } }>,
    reply: FastifyReply
  ) => {
    const user = request.supabaseUser;

    if (!user) {
      throw new AppException("Usuário não autenticado.", 401, ErrorCodes.UNAUTHORIZED);
    }

    const { fcm_token } = request.body;

    if (!fcm_token) {
      throw new AppException("Campo 'fcm_token' é obrigatório.", 400, ErrorCodes.VALIDATION_ERROR);
    }

    await this.profileRepository.updateFcmToken(user.id, fcm_token);

    return reply.status(200).send(apiSuccess(null, "Token FCM salvo com sucesso."));
  };
}
