import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { CreatePetInput, Pet } from "../models/pet.model";

const PET_PUBLIC_FIELDS = "id, image_href, name, created_at, birth_date, owner_id, raca, cor, sexo, descricao";

export class PetRepository {
  async create(input: CreatePetInput): Promise<Pet> {
    const { data, error } = await supabaseAdmin
      .from("pets")
      .insert({
        image_href: input.image_href ?? null,
        name: input.name,
        owner_id: input.owner_id,
        raca: input.raca,
        cor: input.cor,
        sexo: input.sexo,
        descricao: input.descricao
      })
      .select(PET_PUBLIC_FIELDS)
      .single();

    if (error) {
      console.error("Erro Supabase (Create):", error);
      throw new AppException("Não foi possível criar o pet.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data;
  }

  async findManyByOwnerId(ownerId: string): Promise<Pet[]> {
    const { data, error } = await supabaseAdmin
      .from("pets")
      .select(PET_PUBLIC_FIELDS)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro Supabase (List):", error);
      throw new AppException("Não foi possível listar os pets.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data;
  }
}