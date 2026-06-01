import { z } from "zod";

export const updateProfileBodySchema = z
  .object({
    full_name: z
      .string({ error: "Informe o nome." })
      .trim()
      .min(2, "O nome deve ter no mínimo 2 caracteres.")
      .max(120, "O nome deve ter no máximo 120 caracteres.")
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\d{11}$/, "Informe o telefone com DDD e 9 números.")
      .nullable()
      .optional(),
    gender: z
      .enum(["Masculino", "Feminino", "Outro"])
      .nullable()
      .optional(),
    avatar_url: z
      .string()
      .trim()
      .max(500, "A URL do avatar deve ter no máximo 500 caracteres.")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
