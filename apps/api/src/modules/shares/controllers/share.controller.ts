import type { FastifyReply, FastifyRequest } from "fastify";
import { apiSuccess } from "../../../shared/utils/api-response";
import { ShareService } from "../services/share.service";
import type { CreateShareBody, UpdatePermissionBody } from "../validators/share.validator";

export class ShareController {
  constructor(private readonly shareService = new ShareService()) {}

  create = async (
    request: FastifyRequest<{ Params: { petId: string }; Body: CreateShareBody }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { petId } = request.params;

    const share = await this.shareService.sharePet(
      petId,
      ownerId,
      request.body.email,
      request.body.permission
    );

    return reply.status(201).send(apiSuccess(share, "Pet compartilhado com sucesso."));
  };

  list = async (
    request: FastifyRequest<{ Params: { petId: string } }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { petId } = request.params;

    const shares = await this.shareService.listShares(petId, ownerId);

    return reply.status(200).send(apiSuccess(shares, "Compartilhamentos listados."));
  };

  remove = async (
    request: FastifyRequest<{ Params: { petId: string; shareId: string } }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { shareId } = request.params;

    await this.shareService.removeShare(shareId, ownerId);

    return reply.status(200).send(apiSuccess(null, "Compartilhamento removido."));
  };

  updatePermission = async (
    request: FastifyRequest<{ Params: { petId: string; shareId: string }; Body: UpdatePermissionBody }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { shareId } = request.params;

    const share = await this.shareService.updatePermission(shareId, ownerId, request.body.permission);

    return reply.status(200).send(apiSuccess(share, "Permissão atualizada."));
  };

  listSharedWithMe = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const userId = request.supabaseUser!.id;

    const pets = await this.shareService.getSharedPets(userId);

    return reply.status(200).send(apiSuccess(pets, "Pets compartilhados listados."));
  };
}
