import { z } from "zod";

export const saveLocationBodySchema = z.object({
  latitude: z.number({ required_error: "Latitude é obrigatória." }),
  longitude: z.number({ required_error: "Longitude é obrigatória." }),
  precision: z.number().nullable().optional(),
});

export type SaveLocationBody = z.infer<typeof saveLocationBodySchema>;
