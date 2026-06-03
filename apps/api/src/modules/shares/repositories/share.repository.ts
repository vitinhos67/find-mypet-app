import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { CreateShareInput, PetShare, SharedPetResult } from "../models/share.model";

export class ShareRepository {
  async resolveUserIdByEmail(email: string): Promise<string> {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      throw new AppException("Erro ao buscar usuário.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }

    const user = data?.users?.find((u) => u.email === email);
    if (!user) {
      throw new AppException(`Nenhuma conta encontrada com o email "${email}".`, 404, ErrorCodes.NOT_FOUND);
    }

    return user.id;
  }

  async create(input: CreateShareInput): Promise<PetShare> {
    const { data, error } = await supabaseAdmin
      .from("pet_shares")
      .insert({
        pet_id: input.pet_id,
        owner_id: input.owner_id,
        shared_with_user_id: input.shared_with_user_id,
        permission: input.permission,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new AppException("Este pet já foi compartilhado com esse usuário.", 409, ErrorCodes.CONFLICT);
      }
      throw new AppException("Não foi possível compartilhar o pet.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data;
  }

  async findByPetAndOwner(petId: string, ownerId: string): Promise<PetShare[]> {
    const { data, error } = await supabaseAdmin
      .from("pet_shares")
      .select("*")
      .eq("pet_id", petId)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppException("Não foi possível listar compartilhamentos.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }

    const rows = data || [];
    if (rows.length === 0) return rows;

    // Enriquece com o email de cada usuário (só para exibição)
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const usersMap = new Map(usersData?.users?.map((u) => [u.id, u.email]) ?? []);

    return rows.map((row) => ({
      ...row,
      shared_with_email: usersMap.get(row.shared_with_user_id) ?? row.shared_with_user_id,
    }));
  }

  async delete(shareId: string, ownerId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("pet_shares")
      .delete()
      .eq("id", shareId)
      .eq("owner_id", ownerId);

    if (error) {
      throw new AppException("Não foi possível remover o compartilhamento.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
  }

  async findSharedPetsForUser(userId: string): Promise<SharedPetResult[]> {
    const { data, error } = await supabaseAdmin
      .from("pet_shares")
      .select(`
        id,
        permission,
        pets (
          id,
          image_href,
          name,
          raca,
          cor,
          sexo,
          descricao,
          owner_id,
          created_at
        )
      `)
      .eq("shared_with_user_id", userId);

    if (error) {
      throw new AppException("Não foi possível buscar pets compartilhados.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }

    return (data || []).map((row: any) => ({
      share_id: row.id,
      permission: row.permission,
      ...row.pets,
    }));
  }

  async updatePermission(shareId: string, ownerId: string, permission: string): Promise<PetShare> {
    const { data, error } = await supabaseAdmin
      .from("pet_shares")
      .update({ permission })
      .eq("id", shareId)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error) {
      throw new AppException("Não foi possível atualizar a permissão.", 500, ErrorCodes.INTERNAL_ERROR, error.message);
    }
    return data;
  }
}
