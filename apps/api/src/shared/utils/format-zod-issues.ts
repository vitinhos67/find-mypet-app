import type { ZodError } from "zod";

export function formatZodIssues(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
}
