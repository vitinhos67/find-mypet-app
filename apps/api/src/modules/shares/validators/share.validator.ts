import { z } from "zod";

export const createShareBodySchema = z.object({
  email: z.string().email("Email inválido."),
  permission: z.enum(["VIEW", "EDIT"]).default("VIEW"),
});

export const updatePermissionBodySchema = z.object({
  permission: z.enum(["VIEW", "EDIT"]),
});

export type CreateShareBody = z.infer<typeof createShareBodySchema>;
export type UpdatePermissionBody = z.infer<typeof updatePermissionBodySchema>;
