import type { FastifyReply, FastifyRequest } from "fastify";

import { apiSuccess } from "../../../shared/utils/api-response";
import { PetService } from "../services/pet.service";
import type { CreatePetBody } from "../validators/create.validator";

export class PetController {
  constructor(private readonly petService = new PetService()) {}

  create = async (
    request: FastifyRequest<{ Body: CreatePetBody }> ,
    reply: FastifyReply
  ) => {
    const ownerId = request.user!.id;

    const pet = await this.petService.create({
      ...request.body,
      owner_id: ownerId,
    });

    return reply.status(201).send(apiSuccess(pet, "Pet criado com sucesso."));
  };
}
