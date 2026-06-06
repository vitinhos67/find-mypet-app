import type { FastifyReply, FastifyRequest } from "fastify";

import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import { apiSuccess } from "../../../shared/utils/api-response";
import { PetService } from "../services/pet.service";
import type { CreatePetBody } from "../validators/create.validator";

export class PetController {
  constructor(private readonly petService = new PetService()) { }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.supabaseUser!.id;
    const { id } = request.params;
    const pet = await this.petService.getById(id, userId);
    return reply.status(200).send(apiSuccess(pet, "Pet encontrado."));
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const ownerId = request.supabaseUser!.id;
    const pets = await this.petService.list(ownerId);

    return reply.status(200).send(apiSuccess(pets, "Pets listados com sucesso."));
  };

  create = async (
    request: FastifyRequest<{ Body: CreatePetBody }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const pet = await this.petService.create({
      image_href: request.body.foto,
      name: request.body.nome,
      raca: request.body.raca,
      cor: request.body.cor,
      sexo: request.body.sexo,
      descricao: request.body.descricao,
      owner_id: ownerId,
    });

    return reply.status(201).send(apiSuccess(pet, "Pet criado com sucesso."));
  };
  update = async (
    request: FastifyRequest<{ Params: { id: string }, Body: CreatePetBody }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { id } = request.params;

    const pet = await this.petService.update(id, ownerId, {
      image_href: request.body.foto,
      name: request.body.nome,
      raca: request.body.raca,
      cor: request.body.cor,
      sexo: request.body.sexo,
      descricao: request.body.descricao,
      owner_id: ownerId,
    });

    return reply.status(200).send(apiSuccess(pet, "Pet atualizado com sucesso."));
  };

  delete = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { id } = request.params;

    await this.petService.delete(id, ownerId);

    return reply.status(200).send(apiSuccess(null, "Pet removido com sucesso."));
  };

  uploadImage = async (
    request: FastifyRequest<{ Body: { base64: string; mimeType?: string } }>,
    reply: FastifyReply
  ) => {
    const { base64, mimeType } = request.body;

    if (!base64) {
      throw new AppException("Campo 'base64' é obrigatório.", 400, ErrorCodes.VALIDATION_ERROR);
    }

    const fileName = `${Date.now()}_pet.jpg`;
    const filePath = `pets/${fileName}`;
    const buffer = Buffer.from(base64, "base64");

    const { error } = await supabaseAdmin.storage
      .from("pets")
      .upload(filePath, buffer, { contentType: mimeType || "image/jpeg" });

    if (error) {
      throw new AppException("Falha ao fazer upload da imagem.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("pets")
      .getPublicUrl(filePath);

    return reply.status(200).send(apiSuccess({ url: publicUrl }, "Upload realizado com sucesso."));
  };
}