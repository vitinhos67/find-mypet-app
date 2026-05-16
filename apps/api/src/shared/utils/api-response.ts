export function apiSuccess<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    ...(message ? { message } : {}),
  };
}

export function apiError(
  message: string,
  code: string,
  details?: unknown
) {
  return {
    success: false as const,
    error: {
      message,
      code,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
