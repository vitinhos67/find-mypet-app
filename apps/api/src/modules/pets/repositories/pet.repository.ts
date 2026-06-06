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

  async findById(id: string, userId: string): Promise<Pet | null> {
    const { data: pet, error } = await supabaseAdmin
      .from("pets")
      .select(PET_PUBLIC_FIELDS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new AppException("Erro ao buscar pet.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    if (!pet) return null;
    if (pet.owner_id === userId) return pet;

    const { data: share } = await supabaseAdmin
      .from("pet_shares")
      .select("id")
      .eq("pet_id", id)
      .eq("shared_with_user_id", userId)
      .maybeSingle();

    if (share) return pet;

    throw new AppException("Pet não encontrado.", 404, ErrorCodes.NOT_FOUND);
  }

  async findManyByOwnerId(ownerId: string): Promise<Pet[]> {
    console.log("Buscando pets para o owner_id:", ownerId);
    const { data, error } = await supabaseAdmin
      .from("pets")
      .select(PET_PUBLIC_FIELDS)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro Supabase (List):", error);
      throw new AppException("Não foi possível listar os pets.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data || [];
  }
  async update(id: string, ownerId: string, data: Partial<CreatePetInput>): Promise<Pet> {
    const { data: updatedData, error } = await supabaseAdmin
      .from("pets")
      .update({
        image_href: data.image_href,
        name: data.name,
        raca: data.raca,
        cor: data.cor,
        sexo: data.sexo,
        descricao: data.descricao
      })
      .eq("id", id)
      .eq("owner_id", ownerId) 
      .select(PET_PUBLIC_FIELDS)
      .single();

    if (error) {
      console.error("Erro Supabase (Update):", error);
      throw new AppException("Não foi possível atualizar o pet.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return updatedData;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("pets")
      .delete()
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (error) {
      console.error("Erro Supabase (Delete):", error);
      throw new AppException("Não foi possível excluir o pet.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
  }
}