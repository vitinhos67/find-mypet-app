import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { PetShare, SharedPetResult } from "../models/share.model";
import type { SharePermission } from "../models/share.model";
import { ShareRepository } from "../repositories/share.repository";

export class ShareService {
  constructor(private readonly shareRepository = new ShareRepository()) {}

  async sharePet(petId: string, ownerId: string, email: string, permission: SharePermission): Promise<PetShare> {
    const { data: pet, error } = await supabaseAdmin
      .from("pets")
      .select("id, owner_id")
      .eq("id", petId)
      .eq("owner_id", ownerId)
      .single();

    if (error || !pet) {
      throw new AppException("Pet não encontrado ou sem permissão.", 404, ErrorCodes.NOT_FOUND);
    }

    const sharedWithUserId = await this.shareRepository.resolveUserIdByEmail(email);

    if (sharedWithUserId === ownerId) {
      throw new AppException("Você não pode compartilhar um pet consigo mesmo.", 400, ErrorCodes.VALIDATION_ERROR);
    }

    return this.shareRepository.create({
      pet_id: petId,
      owner_id: ownerId,
      shared_with_user_id: sharedWithUserId,
      permission,
    });
  }

  async listShares(petId: string, ownerId: string): Promise<PetShare[]> {
    return this.shareRepository.findByPetAndOwner(petId, ownerId);
  }

  async removeShare(shareId: string, ownerId: string): Promise<void> {
    return this.shareRepository.delete(shareId, ownerId);
  }

  async getSharedPets(userId: string): Promise<SharedPetResult[]> {
    return this.shareRepository.findSharedPetsForUser(userId);
  }

  async updatePermission(shareId: string, ownerId: string, permission: string): Promise<PetShare> {
    return this.shareRepository.updatePermission(shareId, ownerId, permission);
  }
}
