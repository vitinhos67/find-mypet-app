import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { SafeZone, UpsertSafeZoneInput } from "../models/safe-zone.model";
import { SafeZoneRepository } from "../repositories/safe-zone.repository";

export class SafeZoneService {
  constructor(private readonly repo = new SafeZoneRepository()) {}

  async upsert(input: UpsertSafeZoneInput): Promise<SafeZone> {
    const { data: pet, error } = await supabaseAdmin
      .from("pets")
      .select("id")
      .eq("id", input.pet_id)
      .eq("owner_id", input.owner_id)
      .single();

    if (error || !pet) {
      throw new AppException("Pet não encontrado ou sem permissão.", 404, ErrorCodes.NOT_FOUND);
    }

    return this.repo.upsert(input);
  }

  async get(petId: string): Promise<SafeZone | null> {
    return this.repo.findByPetId(petId);
  }

  async delete(petId: string, ownerId: string): Promise<void> {
    return this.repo.delete(petId, ownerId);
  }
}
