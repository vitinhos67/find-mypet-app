import type { User } from "../../modules/users/models/user.model";
import type { User as SupabaseUser } from "@supabase/supabase-js";
declare module "fastify" {
  interface FastifyRequest {
    user?: User;
    sessionId?: string;
    supabaseUser?: SupabaseUser;
  }
}
