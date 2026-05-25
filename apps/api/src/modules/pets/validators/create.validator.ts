import { z } from "zod";

export const createPetBodySchema = z.object({
  image_href: z
    .string()
    .trim()
    .max(2048, "URL da imagem muito longa.")
    .optional()
    .nullable(),
  name: z
    .string({ error: "Informe o nome do pet." })
    .trim()
    .min(1, "O nome do pet não pode ser vazio.")
    .max(120, "O nome do pet deve ter no máximo 120 caracteres."),
  birth_date: z.string().trim().optional().nullable(),
});

export type CreatePetBody = z.infer<typeof createPetBodySchema>;
