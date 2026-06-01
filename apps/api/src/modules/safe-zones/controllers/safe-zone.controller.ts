import type { FastifyReply, FastifyRequest } from "fastify";
import { apiSuccess } from "../../../shared/utils/api-response";
import { SafeZoneService } from "../services/safe-zone.service";
import type { UpsertSafeZoneBody } from "../validators/safe-zone.validator";

export class SafeZoneController {
  constructor(private readonly service = new SafeZoneService()) {}

  upsert = async (
    request: FastifyRequest<{ Params: { petId: string }; Body: UpsertSafeZoneBody }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { petId } = request.params;

    const zone = await this.service.upsert({
      pet_id: petId,
      owner_id: ownerId,
      name: request.body.name,
      latitude: request.body.latitude,
      longitude: request.body.longitude,
      radius_meters: request.body.radius_meters,
      is_active: request.body.is_active,
    });

    return reply.status(200).send(apiSuccess(zone, "Zona segura salva."));
  };

  get = async (
    request: FastifyRequest<{ Params: { petId: string } }>,
    reply: FastifyReply
  ) => {
    const { petId } = request.params;
    const zone = await this.service.get(petId);
    return reply.status(200).send(apiSuccess(zone, "Zona segura obtida."));
  };

  delete = async (
    request: FastifyRequest<{ Params: { petId: string } }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { petId } = request.params;
    await this.service.delete(petId, ownerId);
    return reply.status(200).send(apiSuccess(null, "Zona segura removida."));
  };
}
