import type { FastifyRequest } from "fastify";
import type { ZodType } from "zod";

import { AppException } from "../exceptions/app.exception";
import { ErrorCodes } from "../exceptions/error-codes";
import { formatZodIssues } from "../utils/format-zod-issues";

export function validateBody<T>(schema: ZodType<T>) {
  return async (request: FastifyRequest) => {
    const result = schema.safeParse(request.body ?? {});

    if (!result.success) {
      throw new AppException(
        "Dados de entrada inválidos.",
        400,
        ErrorCodes.VALIDATION_ERROR,
        { fields: formatZodIssues(result.error) }
      );
    }

    request.body = result.data;
  };
}
