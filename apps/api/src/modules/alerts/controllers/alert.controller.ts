import type { FastifyReply, FastifyRequest } from "fastify";
import { apiSuccess } from "../../../shared/utils/api-response";
import { AlertService } from "../services/alert.service";

export class AlertController {
  constructor(private readonly service = new AlertService()) {}

  listUnread = async (request: FastifyRequest, reply: FastifyReply) => {
    const ownerId = request.supabaseUser!.id;
    const alerts = await this.service.getUnread(ownerId);
    return reply.status(200).send(apiSuccess(alerts, "Alertas listados."));
  };

  markAllRead = async (request: FastifyRequest, reply: FastifyReply) => {
    const ownerId = request.supabaseUser!.id;
    await this.service.markAllRead(ownerId);
    return reply.status(200).send(apiSuccess(null, "Alertas marcados como lidos."));
  };

  markRead = async (
    request: FastifyRequest<{ Params: { alertId: string } }>,
    reply: FastifyReply
  ) => {
    const ownerId = request.supabaseUser!.id;
    const { alertId } = request.params;
    await this.service.markRead(alertId, ownerId);
    return reply.status(200).send(apiSuccess(null, "Alerta marcado como lido."));
  };
}
