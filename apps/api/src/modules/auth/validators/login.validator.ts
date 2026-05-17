import { z } from "zod";

export const loginBodySchema = z.object({
  email: z
    .string({ error: "Informe o e-mail." })
    .trim()
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string({ error: "Informe a senha." })
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
