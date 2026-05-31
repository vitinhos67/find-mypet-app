import type { FastifyReply, FastifyRequest } from "fastify";

import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { apiSuccess } from "../../../shared/utils/api-response";
import { LocationService } from "../services/location.service";
import type { SaveLocationBody } from "../validators/save.validator";

export class LocationController {
  constructor(private readonly locationService = new LocationService()) {}

  get = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id: petId } = request.params;
    const location = await this.locationService.getLastByPetId(petId);

    if (!location) {
      throw new AppException(
        "Localização não encontrada para este pet.",
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    return reply.status(200).send(
      apiSuccess(
        {
          petId,
          latitude: location.latitude,
          longitude: location.longitude,
          precision: location.precision,
          updatedAt: location.recorded_at,
        },
        "Localização obtida com sucesso."
      )
    );
  };

  saveForDevice = async (
    request: FastifyRequest<{ Params: { id: string }; Body: SaveLocationBody }>,
    reply: FastifyReply
  ) => {
    const { id: deviceId } = request.params;
    const { latitude, longitude, precision } = request.body;

    const location = await this.locationService.saveForDevice({
      device_id: deviceId,
      latitude,
      longitude,
      precision,
    });

    return reply.status(201).send(
      apiSuccess(
        {
          deviceId: location.device_id,
          latitude: location.latitude,
          longitude: location.longitude,
          precision: location.precision,
          updatedAt: location.recorded_at,
        },
        "Localização salva com sucesso."
      )
    );
  };
}
