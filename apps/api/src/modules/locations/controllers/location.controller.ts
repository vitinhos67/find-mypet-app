import type { FastifyReply, FastifyRequest } from "fastify";

import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { apiSuccess } from "../../../shared/utils/api-response";
import { LocationService } from "../services/location.service";

// 1. Tipagem absoluta para o Fastify e TypeScript não chorarem
export interface DeviceLocationBody {
  device_id?: string;
  latitude: number | string;
  longitude: number | string;
  precision?: number;
  battery?: number;
  is_fallback?: boolean;
  hardware_log?: string;
}

export interface DeviceLocationParams {
  id?: string;
}

export class LocationController {
  constructor(private readonly locationService = new LocationService()) { }

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
    // 2. Aqui a mágica acontece: o TS agora sabe exatamente o formato da requisição
    request: FastifyRequest<{ Params: DeviceLocationParams; Body: DeviceLocationBody }>,
    reply: FastifyReply
  ) => {

    // Extratificando os dados com segurança
    const body = request.body;
    const deviceId = body.device_id || request.params.id;
    const latitude = body.latitude;
    const longitude = body.longitude;
    const precision = body.precision;

    if (!deviceId) {
      throw new AppException("O device_id é obrigatório no payload.", 400, ErrorCodes.VALIDATION_ERROR);
    }

    // 3. Conversão segura: se o ESP mandar string, vira float.
    const location = await this.locationService.saveForDevice({
      device_id: deviceId,
      latitude: typeof latitude === "string" ? parseFloat(latitude) : latitude,
      longitude: typeof longitude === "string" ? parseFloat(longitude) : longitude,
      precision: precision ? Number(precision) : 0,
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