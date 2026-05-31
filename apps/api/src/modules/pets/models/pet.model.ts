export type Pet = {
  id: string;
  image_href?: string | null;
  name: string;
  created_at: string;
  birth_date?: string | null;
  owner_id: string;
  raca: string;
  cor: string;
  sexo: string;
  descricao: string;
};

export type CreatePetInput = {
  image_href?: string | null;
  name: string;
  birth_date?: string | null;
  owner_id: string;
  raca: string;
  cor: string;
  sexo: string;
  descricao: string;
};

export type UpdatePetInput = Partial<CreatePetInput> & { id: string };