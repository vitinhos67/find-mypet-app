import { z } from "zod";

export const createPetBodySchema = z.object({
  foto: z.string().optional(),
  nome: z.string().min(1, "O nome é obrigatório"),
  raca: z.string(),
  cor: z.string(),
  sexo: z.enum(["MACHO", "FEMEA"]),
  descricao: z.string(),
});

export type CreatePetBody = z.infer<typeof createPetBodySchema>;