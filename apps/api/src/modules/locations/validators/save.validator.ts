import { z } from "zod";

export const saveLocationBodySchema = z.object({
  latitude: z.number({ message: "Latitude é obrigatória." }),
  longitude: z.number({ message: "Longitude é obrigatória." }),
  precision: z.number().nullable().optional(),
});

export type SaveLocationBody = z.infer<typeof saveLocationBodySchema>;
