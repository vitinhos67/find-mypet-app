import type { FastifyReply, FastifyRequest } from "fastify";

import { DatabaseHealthService } from "../services/database-health.service";

export class HealthController {
  constructor(
    private readonly databaseHealthService = new DatabaseHealthService()
  ) {}

  checkDatabase = async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.databaseHealthService.checkConnection();

    if (!result.connected) {
      return reply.status(503).send({
        success: false,
        data: result,
        message: "Falha na conexão com o banco de dados.",
      });
    }

    return reply.send({
      success: true,
      data: result,
      message: "Conexão com o banco de dados estabelecida.",
    });
  };
}
