export type Pet = {
  id: string;
  image_href?: string | null;
  name: string;
  created_at: string;
  birth_date?: string | null;
  // id do usuário que criou/cadastrou o pet
  owner_id: string;
};

export type CreatePetInput = {
  image_href?: string | null;
  name: string;
  birth_date?: string | null;
  owner_id: string;
};

export type UpdatePetInput = Partial<CreatePetInput> & { id: string };
