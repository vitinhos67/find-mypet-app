import "dotenv/config";
import { z } from "zod";

// se faltar alguma variável, já não funciona 
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);