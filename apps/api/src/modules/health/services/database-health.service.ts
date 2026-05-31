import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export interface DatabaseHealthResult {
  connected: boolean;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

export class DatabaseHealthService {
  async checkConnection(): Promise<DatabaseHealthResult> {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const latencyMs = Date.now() - startedAt;

    if (error) {
      return {
        connected: false,
        latencyMs,
        checkedAt,
        error: error.message,
      };
    }

    return {
      connected: true,
      latencyMs,
      checkedAt,
    };
  }
}
