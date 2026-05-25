import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { CreatePetInput, Pet } from "../models/pet.model";

const PET_PUBLIC_FIELDS = "id, image_href, name, created_at, birth_date, owner_id";

export class PetRepository {
  async create(input: CreatePetInput): Promise<Pet> {
    const { data, error } = await supabaseAdmin
      .from("pets")
      .insert({
        image_href: input.image_href ?? null,
        name: input.name,
        birth_date: input.birth_date ?? null,
        owner_id: input.owner_id,
      })
      .select(PET_PUBLIC_FIELDS)
      .single();

    if (error) {
      throw new AppException(
        "Não foi possível criar o pet.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    return data;
  }
}
