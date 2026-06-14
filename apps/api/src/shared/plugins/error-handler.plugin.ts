import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { AppException } from "../exceptions/app.exception";
import { ErrorCodes } from "../exceptions/error-codes";
import { apiError } from "../utils/api-response";
import { formatZodIssues } from "../utils/format-zod-issues";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppException) {
      return reply
        .status(error.statusCode)
        .send(apiError(error.message, error.code, error.details));
    }

    if (error instanceof ZodError) {
      return reply.status(400).send(
        apiError("Dados de entrada inválidos.", ErrorCodes.VALIDATION_ERROR, {
          fields: formatZodIssues(error),
        })
      );
    }

    if (typeof error === "object" && error !== null && "validation" in error && (error as Record<string, unknown>).validation) {
      return reply.status(400).send(
        apiError("Requisição inválida.", ErrorCodes.VALIDATION_ERROR, {
          issues: error.validation,
        })
      );
    }

    app.log.error(error);

    return reply
      .status(500)
      .send(apiError("Erro interno do servidor.", ErrorCodes.INTERNAL_ERROR));
  });
}
