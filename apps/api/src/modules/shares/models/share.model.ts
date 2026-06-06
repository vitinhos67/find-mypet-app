export type SharePermission = "VIEW" | "EDIT";

export interface PetShare {
  id: string;
  pet_id: string;
  owner_id: string;
  shared_with_user_id: string;
  shared_with_email?: string;
  permission: SharePermission;
  created_at: string;
}

export interface CreateShareInput {
  pet_id: string;
  owner_id: string;
  shared_with_user_id: string;
  permission: SharePermission;
}

export interface SharedPetResult {
  share_id: string;
  permission: SharePermission;
  pet_id: string;
  image_href: string | null;
  name: string;
  raca: string | null;
  cor: string | null;
  sexo: string | null;
  descricao: string | null;
  owner_id: string;
  owner_name: string | null;
  created_at: string;
}
