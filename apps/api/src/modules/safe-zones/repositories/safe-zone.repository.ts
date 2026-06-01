import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { SafeZone, UpsertSafeZoneInput } from "../models/safe-zone.model";

export class SafeZoneRepository {
  async upsert(input: UpsertSafeZoneInput): Promise<SafeZone> {
    const { data, error } = await supabaseAdmin
      .from("safe_zones")
      .upsert(
        {
          pet_id: input.pet_id,
          owner_id: input.owner_id,
          name: input.name,
          latitude: input.latitude,
          longitude: input.longitude,
          radius_meters: input.radius_meters,
          is_active: input.is_active,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "pet_id" }
      )
      .select()
      .single();

    if (error) {
      throw new AppException("Não foi possível salvar a zona segura.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data;
  }

  async findByPetId(petId: string): Promise<SafeZone | null> {
    const { data, error } = await supabaseAdmin
      .from("safe_zones")
      .select("*")
      .eq("pet_id", petId)
      .maybeSingle();

    if (error) {
      throw new AppException("Não foi possível buscar a zona segura.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data;
  }

  async findActiveByPetId(petId: string): Promise<SafeZone | null> {
    const { data } = await supabaseAdmin
      .from("safe_zones")
      .select("*")
      .eq("pet_id", petId)
      .eq("is_active", true)
      .maybeSingle();

    return data ?? null;
  }

  async delete(petId: string, ownerId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("safe_zones")
      .delete()
      .eq("pet_id", petId)
      .eq("owner_id", ownerId);

    if (error) {
      throw new AppException("Não foi possível remover a zona segura.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
  }
}
