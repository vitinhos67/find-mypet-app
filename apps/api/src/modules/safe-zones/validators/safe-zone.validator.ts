import { z } from "zod";

export const upsertSafeZoneSchema = z.object({
  name: z.string().min(1).default("Casa"),
  latitude: z.number(),
  longitude: z.number(),
  radius_meters: z.number().int().min(50).max(50000),
  is_active: z.boolean().default(true),
});

export type UpsertSafeZoneBody = z.infer<typeof upsertSafeZoneSchema>;
