import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { Alert } from "../models/alert.model";

export class AlertRepository {
  async createIfNotRecent(
    petId: string,
    ownerId: string,
    latitude: number,
    longitude: number
  ): Promise<Alert | null> {
    // Evita spam: não cria alerta se já existe um nos últimos 30 minutos
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("alerts")
      .select("id")
      .eq("pet_id", petId)
      .gte("triggered_at", since)
      .maybeSingle();

    if (recent) return null;

    const { data } = await supabaseAdmin
      .from("alerts")
      .insert({ pet_id: petId, owner_id: ownerId, latitude, longitude })
      .select()
      .single();

    return data ?? null;
  }

  async findUnreadByOwner(ownerId: string): Promise<Alert[]> {
    const { data } = await supabaseAdmin
      .from("alerts")
      .select("*")
      .eq("owner_id", ownerId)
      .is("read_at", null)
      .order("triggered_at", { ascending: false })
      .limit(50);

    return data ?? [];
  }

  async markAllRead(ownerId: string): Promise<void> {
    await supabaseAdmin
      .from("alerts")
      .update({ read_at: new Date().toISOString() })
      .eq("owner_id", ownerId)
      .is("read_at", null);
  }

  async markRead(alertId: string, ownerId: string): Promise<void> {
    await supabaseAdmin
      .from("alerts")
      .update({ read_at: new Date().toISOString() })
      .eq("id", alertId)
      .eq("owner_id", ownerId);
  }
}
