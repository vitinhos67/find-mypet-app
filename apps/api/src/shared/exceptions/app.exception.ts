import type { ErrorCode } from "./error-codes";

export class AppException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppException";
  }
}
