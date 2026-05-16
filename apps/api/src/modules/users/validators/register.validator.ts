import { z } from "zod";

export const registerBodySchema = z.object({
  name: z
    .string({ error: "Informe o nome." })
    .trim()
    .min(2, "O nome deve ter no mínimo 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  email: z
    .string({ error: "Informe o e-mail." })
    .trim()
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string({ error: "Informe a senha." })
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
