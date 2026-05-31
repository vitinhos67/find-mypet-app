import type { FastifyReply, FastifyRequest } from "fastify";

import { apiSuccess } from "../../../shared/utils/api-response";
import { PetService } from "../services/pet.service";
import type { CreatePetBody } from "../validators/create.validator";

export class PetController {
  constructor(private readonly petService = new PetService()) { }

  // Mantemos o List para a tua Home Screen continuar a funcionar
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
}